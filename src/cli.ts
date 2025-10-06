#!/usr/bin/env node
import { Command } from 'commander';
import { scanCommand } from './commands/scan';
import { initCommand } from './commands/init';
import { badgeCommand } from './commands/badge';

const program = new Command();

program
  .name('baseline')
  .description('CLI tool to check Baseline web features compliance')
  .version('1.1.0');

program
  .command('scan')
  .description('Scan your project for Baseline compliance')
  .option('-p, --path <path>', 'Path to scan', '.')
  .option('-f, --format <format>', 'Output format (summary, json, junit)', 'summary')
  .option('--dry-run', 'Preview results without failing builds', false)
  .action(scanCommand);

program
  .command('init')
  .description('Initialize Baseline configuration')
  .option('--github', 'Generate GitHub Actions workflow', false)
  .action(initCommand);

program
  .command('badge')
  .description('Generate a Baseline compliance badge for your README')
  .option('-p, --path <path>', 'Path to project', '.')
  .action(badgeCommand);

program.parse(process.argv);
