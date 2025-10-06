import { ScanSummary } from '../types';

export function formatSummary(summary: ScanSummary): string {
  let output = '\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += '  📊 Baseline Compliance Report\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  output += `  Files scanned: ${summary.totalFiles}\n`;
  output += `  Features detected: ${summary.totalFeatures}\n\n`;

  output += `  ✅ Baseline compliant: ${summary.baselineCompliant}\n`;
  output += `  ⚠️  Limited support: ${summary.limitedSupport}\n`;
  output += `  🧪 Experimental: ${summary.experimental}\n\n`;

  if (summary.results.length > 0) {
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '  📁 Detailed Results\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const result of summary.results) {
      if (result.features.length === 0) continue;

      output += `  📄 ${result.file}\n`;

      // Group features by status
      const byStatus = {
        baseline: result.features.filter(f => f.status === 'baseline'),
        limited: result.features.filter(f => f.status === 'limited'),
        experimental: result.features.filter(f => f.status === 'experimental')
      };

      if (byStatus.baseline.length > 0) {
        output += `     ✅ Baseline features:\n`;
        byStatus.baseline.forEach(f => {
          output += `        • ${f.featureName} (${f.matchedPattern})\n`;
        });
      }

      if (byStatus.limited.length > 0) {
        output += `     ⚠️  Limited support:\n`;
        byStatus.limited.forEach(f => {
          output += `        • ${f.featureName} (${f.matchedPattern})\n`;
        });
      }

      if (byStatus.experimental.length > 0) {
        output += `     🧪 Experimental:\n`;
        byStatus.experimental.forEach(f => {
          output += `        • ${f.featureName} (${f.matchedPattern})\n`;
        });
      }

      output += '\n';
    }
  }

  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

  const complianceRate = summary.totalFeatures > 0
    ? ((summary.baselineCompliant / summary.totalFeatures) * 100).toFixed(1)
    : '100.0';

  output += `  Compliance rate: ${complianceRate}%\n`;
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  return output;
}

export function formatJSON(summary: ScanSummary): string {
  return JSON.stringify(summary, null, 2);
}

export function formatJUnit(summary: ScanSummary): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<testsuites name="Baseline Compliance" tests="${summary.totalFeatures}" failures="${summary.experimental + summary.limitedSupport}">\n`;
  xml += `  <testsuite name="Baseline Features" tests="${summary.totalFeatures}" failures="${summary.experimental + summary.limitedSupport}">\n`;

  for (const result of summary.results) {
    for (const feature of result.features) {
      xml += `    <testcase name="${feature.featureName}" classname="${result.file}">\n`;

      if (feature.status === 'experimental' || feature.status === 'limited') {
        xml += `      <failure message="Feature '${feature.featureName}' has ${feature.status} support" type="${feature.status}">\n`;
        xml += `        Feature: ${feature.featureName}\n`;
        xml += `        Status: ${feature.status}\n`;
        xml += `        Pattern: ${feature.matchedPattern}\n`;
        xml += `      </failure>\n`;
      }

      xml += `    </testcase>\n`;
    }
  }

  xml += '  </testsuite>\n';
  xml += '</testsuites>\n';

  return xml;
}
