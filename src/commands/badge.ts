import * as path from 'path';
import * as fs from 'fs';
import { scanFiles } from '../utils/fileScanner';
import { FeatureDetector } from '../scanners/featureDetector';
import { loadConfig } from '../utils/config';

interface BadgeOptions {
  path?: string;
}

export async function badgeCommand(options: BadgeOptions): Promise<void> {
  const targetPath = path.resolve(options.path || '.');

  console.log('\n🏅 Generating Baseline compliance badge...\n');

  // Load configuration
  const config = loadConfig();

  // Scan files
  const files = await scanFiles(targetPath, config.ignore);

  // Initialize feature detector
  const detector = new FeatureDetector();

  // Analyze files
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

      // Count by status
      uniqueFeatures.forEach(f => {
        if (f.status === 'baseline') totalBaselineCompliant++;
        else if (f.status === 'limited') totalLimitedSupport++;
        else totalExperimental++;
      });
    }
  }

  const totalFeatures = totalBaselineCompliant + totalLimitedSupport + totalExperimental;
  const complianceRate = totalFeatures > 0
    ? ((totalBaselineCompliant / totalFeatures) * 100).toFixed(0)
    : '100';

  // Determine badge color
  let color = 'brightgreen';
  let status = 'Compliant';

  if (totalExperimental > 0 || parseInt(complianceRate) < 90) {
    color = 'red';
    status = `${complianceRate}%`;
  } else if (totalLimitedSupport > 0 || parseInt(complianceRate) < 95) {
    color = 'yellow';
    status = `${complianceRate}%`;
  } else {
    status = `${complianceRate}%`;
  }

  // Generate badge markdown
  const badgeUrl = `https://img.shields.io/badge/Baseline-${encodeURIComponent(status)}-${color}`;
  const badgeMarkdown = `![Baseline Compliant](${badgeUrl})`;

  console.log('✅ Badge generated!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Copy and paste this into your README.md:\n');
  console.log(badgeMarkdown);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Optionally save to a file
  const badgeFile = path.join(targetPath, '.baseline-badge.md');
  fs.writeFileSync(badgeFile, badgeMarkdown);
  console.log(`💾 Badge markdown saved to: ${badgeFile}\n`);

  console.log('📊 Summary:');
  console.log(`   Compliance rate: ${complianceRate}%`);
  console.log(`   Total features: ${totalFeatures}`);
  console.log(`   ✅ Baseline: ${totalBaselineCompliant}`);
  console.log(`   ⚠️  Limited: ${totalLimitedSupport}`);
  console.log(`   🧪 Experimental: ${totalExperimental}\n`);
}
