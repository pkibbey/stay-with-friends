#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to check and update packages in all apps to their latest versions
 * Usage:
 *   npm run update-packages                    # Check for outdated packages
 *   npm run update-packages -- --update        # Update packages to latest versions
 *   npm run update-packages -- --app frontend  # Check only frontend
 *   npm run update-packages -- --app backend   # Check only backend
 */

const APPS = ['apps/frontend', 'apps/backend'];

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command} (in ${cwd})`);
    const result = execSync(command, {
      cwd,
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return result;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return null;
  }
}

function checkNpmCheckUpdates() {
  try {
    execSync('npx npm-check-updates --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log('npm-check-updates not found, installing...');
    runCommand('npm install -g npm-check-updates');
    return true;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    update: false,
    app: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--update':
        options.update = true;
        break;
      case '--app':
        if (i + 1 < args.length) {
          options.app = args[i + 1];
          i++; // Skip next arg
        }
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🔍 Node Package Updater for Stay With Friends Monorepo

Usage:
  npm run update-packages                    # Check for outdated packages
  npm run update-packages -- --update        # Update packages to latest versions
  npm run update-packages -- --app frontend  # Check only frontend app
  npm run update-packages -- --app backend   # Check only backend app
  npm run update-packages -- --help          # Show this help

Options:
  --update    Update package.json files and install new versions
  --app       Specify which app to process (frontend or backend)
  --help      Show this help message

Examples:
  npm run update-packages
  npm run update-packages -- --update --app frontend
`);
}

function processApp(appPath, shouldUpdate) {
  const packageJsonPath = path.join(appPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`Skipping ${appPath} - no package.json found`);
    return;
  }

  console.log(`\n=== Processing ${appPath} ===`);

  if (shouldUpdate) {
    console.log('🔄 Updating packages to latest versions...');
    runCommand('npx npm-check-updates -u', appPath);
    console.log('📦 Installing updated packages...');
    runCommand('npm install', appPath);
  } else {
    console.log('🔍 Checking for outdated packages...');
    runCommand('npx npm-check-updates', appPath);
  }
}

function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  console.log('🔍 Node Package Updater for Stay With Friends Monorepo');
  console.log('==================================================\n');

  if (options.update) {
    console.log('⚠️  UPDATE MODE: This will update package.json files and install new versions');
    console.log('Make sure to test your apps after updating!\n');
  } else {
    console.log('📋 CHECK MODE: This will only show outdated packages (safe to run)\n');
  }

  // Check if npm-check-updates is available
  if (!checkNpmCheckUpdates()) {
    console.error('Failed to install npm-check-updates. Please install it manually: npm install -g npm-check-updates');
    process.exit(1);
  }

  // Determine which apps to process
  let appsToProcess = APPS;
  if (options.app) {
    const appPath = `apps/${options.app}`;
    if (!APPS.includes(appPath)) {
      console.error(`Invalid app: ${options.app}. Available apps: frontend, backend`);
      process.exit(1);
    }
    appsToProcess = [appPath];
  }

  // Process each app
  for (const app of appsToProcess) {
    processApp(app, options.update);
  }

  console.log('\n=== Summary ===');
  if (options.update) {
    console.log('✅ Packages updated! Remember to:');
    console.log('   - Run tests: npm test');
    console.log('   - Check for breaking changes in updated packages');
    console.log('   - Update any code that might be affected by package updates');
  } else {
    console.log('📊 To update packages, run: npm run update-packages -- --update');
  }
}

if (require.main === module) {
  main();
}