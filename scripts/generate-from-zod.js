#!/usr/bin/env node
const path = require('path');
const { execSync } = require('child_process');

/**
 * ZOD-FIRST TYPE GENERATION
 * 
 * Uses the Zod schema definitions as the single source of truth
 * to generate all types, validations, and transformations.
 */

const repoRoot = path.resolve(__dirname, '..');

// Since we're using TypeScript schemas, we need to compile and import them
// First, let's use ts-node to run the TypeScript schema file
console.log('🚀 Generating from Zod schemas...');

try {
  // Use tsx (or ts-node) to run the TypeScript generation
  execSync(`npx tsx "${__filename.replace('.js', '.ts')}"`, { 
    cwd: repoRoot,
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('❌ Failed to run TypeScript generation:', error.message);
  console.log('💡 Installing tsx...');
  try {
    execSync('npm install tsx --save-dev', { cwd: repoRoot, stdio: 'inherit' });
    execSync(`npx tsx "${__filename.replace('.js', '.ts')}"`, { 
      cwd: repoRoot,
      stdio: 'inherit' 
    });
  } catch (installError) {
    console.error('❌ Failed to install tsx:', installError.message);
    process.exit(1);
  }
}