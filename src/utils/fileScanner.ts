import fg from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';

export interface ScannedFile {
  path: string;
  content: string;
  type: 'js' | 'ts' | 'css' | 'html';
}

export async function scanFiles(targetPath: string, ignorePatterns: string[] = []): Promise<ScannedFile[]> {
  const patterns = [
    '**/*.{js,jsx,ts,tsx}',
    '**/*.css',
    '**/*.html'
  ];

  const defaultIgnore = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.min.js',
    '**/*.min.css'
  ];

  const files = await fg(patterns, {
    cwd: targetPath,
    ignore: [...defaultIgnore, ...ignorePatterns],
    absolute: false,
    dot: false
  });

  const scannedFiles: ScannedFile[] = [];

  for (const file of files) {
    const fullPath = path.join(targetPath, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const ext = path.extname(file);
      let type: 'js' | 'ts' | 'css' | 'html';

      if (['.js', '.jsx'].includes(ext)) {
        type = 'js';
      } else if (['.ts', '.tsx'].includes(ext)) {
        type = 'ts';
      } else if (ext === '.css') {
        type = 'css';
      } else {
        type = 'html';
      }

      scannedFiles.push({
        path: file,
        content,
        type
      });
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}`);
    }
  }

  return scannedFiles;
}
