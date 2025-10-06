import * as path from 'path';
import { scanFiles } from '../utils/fileScanner';
import { FeatureDetector } from '../scanners/featureDetector';
import { loadConfig } from '../utils/config';
import { ScanResult, ScanSummary } from '../types';
import { formatSummary, formatJSON, formatJUnit } from '../utils/outputFormatter';
import * as fs from 'fs';

interface ScanOptions {
  path?: string;
  format?: 'summary' | 'json' | 'junit';
  dryRun?: boolean;
}

export async function scanCommand(options: ScanOptions): Promise<void> {
  const targetPath = path.resolve(options.path || '.');
  const format = options.format || 'summary';
  const isDryRun = options.dryRun || false;

  console.log(`\n🔍 Scanning project at: ${targetPath}\n`);

  // Load configuration
  const config = loadConfig();

  // Scan files
  const files = await scanFiles(targetPath, config.ignore);
  console.log(`📁 Found ${files.length} files to analyze...\n`);

  // Initialize feature detector
  const detector = new FeatureDetector();

  // Analyze files
  const results: ScanResult[] = [];
  let totalBaselineCompliant = 0;
  let totalLimitedSupport = 0;
  let totalExperimental = 0;

  for (const file of files) {
    const features = detector.detectFeatures(file.content, file.type);

    if (features.length > 0) {
      // Deduplicate features per file
      const uniqueFeatures = Array.from(
        new Map(features.map(f => [f.featureId, f])).values()
      );

      results.push({
        file: file.path,
        features: uniqueFeatures
      });

      // Count by status
      uniqueFeatures.forEach(f => {
        if (f.status === 'baseline') totalBaselineCompliant++;
        else if (f.status === 'limited') totalLimitedSupport++;
        else totalExperimental++;
      });
    }
  }

  // Create summary
  const summary: ScanSummary = {
    totalFiles: files.length,
    totalFeatures: totalBaselineCompliant + totalLimitedSupport + totalExperimental,
    baselineCompliant: totalBaselineCompliant,
    limitedSupport: totalLimitedSupport,
    experimental: totalExperimental,
    results
  };

  // Output results
  let output: string;

  switch (format) {
    case 'json':
      output = formatJSON(summary);
      break;
    case 'junit':
      output = formatJUnit(summary);
      break;
    default:
      output = formatSummary(summary);
  }

  console.log(output);

  // Save output to file if not summary
  if (format === 'json') {
    const outputPath = path.join(targetPath, 'baseline-report.json');
    fs.writeFileSync(outputPath, output);
    console.log(`\n📄 JSON report saved to: ${outputPath}\n`);
  } else if (format === 'junit') {
    const outputPath = path.join(targetPath, 'baseline-report.xml');
    fs.writeFileSync(outputPath, output);
    console.log(`\n📄 JUnit report saved to: ${outputPath}\n`);
  }

  // Determine if build should fail
  const shouldFail = !isDryRun && (
    (config.failOnWarning && (totalLimitedSupport > 0 || totalExperimental > 0))
  );

  if (shouldFail) {
    console.error('❌ Build failed due to non-compliant features.\n');
    process.exit(1);
  } else if (isDryRun) {
    console.log('ℹ️  Dry run mode - build would not fail.\n');
  } else if (totalExperimental > 0) {
    console.log('⚠️  Warning: Experimental features detected, but not failing build.\n');
    console.log('   Set "failOnWarning": true in .baselinerc.json to fail on experimental features.\n');
  } else {
    console.log('✅ All checks passed!\n');
  }
}
