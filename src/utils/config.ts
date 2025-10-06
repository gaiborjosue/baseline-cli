import * as fs from 'fs';
import * as path from 'path';
import { BaselineConfig } from '../types';

const DEFAULT_CONFIG: BaselineConfig = {
  minimumBaseline: '2023',
  ignore: ['node_modules/**', 'dist/**', 'build/**', '*.min.js'],
  failOnWarning: false,
  outputFormat: 'summary'
};

export function loadConfig(configPath?: string): BaselineConfig {
  const configFile = configPath || findConfigFile();

  if (!configFile || !fs.existsSync(configFile)) {
    return DEFAULT_CONFIG;
  }

  try {
    const configContent = fs.readFileSync(configFile, 'utf-8');
    const userConfig = JSON.parse(configContent);
    return { ...DEFAULT_CONFIG, ...userConfig };
  } catch (error) {
    console.warn(`Warning: Could not parse config file ${configFile}. Using defaults.`);
    return DEFAULT_CONFIG;
  }
}

function findConfigFile(): string | null {
  const possibleFiles = [
    '.baselinerc.json',
    '.baselinerc',
    'baseline.config.json'
  ];

  for (const file of possibleFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

export function createDefaultConfig(targetPath: string): void {
  const configPath = path.join(targetPath, '.baselinerc.json');

  if (fs.existsSync(configPath)) {
    console.log('Configuration file already exists.');
    return;
  }

  const config: BaselineConfig = {
    minimumBaseline: '2023',
    ignore: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'vendor/**'
    ],
    failOnWarning: false,
    outputFormat: 'summary'
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Created configuration file at ${configPath}`);
}
