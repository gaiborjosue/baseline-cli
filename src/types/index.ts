export interface BaselineConfig {
  minimumBaseline?: string;
  ignore?: string[];
  failOnWarning?: boolean;
  outputFormat?: 'summary' | 'json' | 'junit';
}

export interface ScanResult {
  file: string;
  features: FeatureMatch[];
}

export interface FeatureMatch {
  featureId: string;
  featureName: string;
  line?: number;
  column?: number;
  status: 'baseline' | 'limited' | 'experimental';
  baselineDate?: string;
  matchedPattern: string;
}

export interface ScanSummary {
  totalFiles: number;
  totalFeatures: number;
  baselineCompliant: number;
  limitedSupport: number;
  experimental: number;
  results: ScanResult[];
}

export type OutputFormat = 'summary' | 'json' | 'junit';
