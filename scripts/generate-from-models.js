#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const modelsPath = path.join(repoRoot, 'schema', 'models.json');
const backendOutDir = path.join(repoRoot, 'apps', 'backend', 'src', 'generated');
const frontendOutDir = path.join(repoRoot, 'apps', 'frontend', 'src', 'generated');

if (!fs.existsSync(modelsPath)) {
  console.error('models.json not found');
  process.exit(1);
}

const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
if (!fs.existsSync(backendOutDir)) fs.mkdirSync(backendOutDir, { recursive: true });
if (!fs.existsSync(frontendOutDir)) fs.mkdirSync(frontendOutDir, { recursive: true });

// Utility function to convert snake_case to camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Generate TypeScript types for backend
const backendTsLines = ["// Generated types - do not edit", ""]; 
for (const [name, def] of Object.entries(models.entities)) {
  backendTsLines.push(`export interface ${name} {`);
  for (const [fName, fDef] of Object.entries(def.fields)) {
    const optional = fDef.notNull || fDef.primary ? '' : '?';
    let tsType;
    
    if (fDef.type === 'integer') {
      tsType = 'number';
    } else if (fDef.type === 'real') {
      tsType = 'number';
    } else if (fDef.type === 'datetime') {
      tsType = 'string';
    } else if (fDef.type === 'json') {
      // Use jsonType if specified, otherwise default to any
      tsType = fDef.jsonType || 'any';
    } else {
      tsType = 'string';
    }
    
    backendTsLines.push(`  ${fName}${optional}: ${tsType};`);
  }
  backendTsLines.push('}', '');
}
fs.writeFileSync(path.join(backendOutDir, 'types.ts'), backendTsLines.join('\n'));

// Generate TypeScript types for frontend (with camelCase field names)
const frontendTsLines = ["// Generated types - do not edit", "// Frontend types with camelCase field names", ""]; 
for (const [name, def] of Object.entries(models.entities)) {
  frontendTsLines.push(`export interface ${name} {`);
  for (const [fName, fDef] of Object.entries(def.fields)) {
    const optional = fDef.notNull || fDef.primary ? '' : '?';
    const camelCaseFieldName = toCamelCase(fName);
    let tsType;
    
    if (fDef.type === 'integer') {
      // Frontend uses string IDs for all ID fields for better compatibility
      tsType = fName.includes('id') || fName === 'id' ? 'string' : 'number';
    } else if (fDef.type === 'real') {
      tsType = 'number';
    } else if (fDef.type === 'datetime') {
      tsType = 'string';
    } else if (fDef.type === 'json') {
      tsType = fDef.jsonType || 'any';
    } else {
      tsType = 'string';
    }
    
    frontendTsLines.push(`  ${camelCaseFieldName}${optional}: ${tsType};`);
  }
  frontendTsLines.push('}', '');
}
fs.writeFileSync(path.join(frontendOutDir, 'types.ts'), frontendTsLines.join('\n'));

// Generate GraphQL SDL
const gqlLines = ['# Generated GraphQL SDL - do not edit', ''];
for (const [name, def] of Object.entries(models.entities)) {
  gqlLines.push(`type ${name} {`);
  for (const [fName, fDef] of Object.entries(def.fields)) {
    let gqlType;
    
    if (fDef.type === 'integer' && fDef.primary) {
      gqlType = 'ID';
    } else if (fDef.type === 'integer') {
      gqlType = 'Int';
    } else if (fDef.type === 'real') {
      gqlType = 'Float';
    } else if (fDef.type === 'datetime') {
      gqlType = 'String';
    } else if (fDef.type === 'json') {
      gqlType = '[String]'; // Default to string array for JSON
    } else {
      gqlType = 'String';
    }
    
    const req = fDef.notNull || fDef.primary ? '!' : '';
    gqlLines.push(`  ${fName}: ${gqlType}${req}`);
  }
  gqlLines.push('}', '');
}
fs.writeFileSync(path.join(backendOutDir, 'schema.graphql'), gqlLines.join('\n'));

// Generate SQL CREATE TABLEs (basic)
const sqlLines = ['-- Generated SQL - do not edit', 'PRAGMA foreign_keys = ON;', ''];
for (const [name, def] of Object.entries(models.entities)) {
  const cols = [];
  for (const [fName, fDef] of Object.entries(def.fields)) {
    let col = `${fName} `;
    if (fDef.type === 'integer') col += 'INTEGER';
    else if (fDef.type === 'datetime') col += 'DATETIME';
    else if (fDef.type === 'json') col += 'TEXT';
    else col += 'TEXT';
    if (fDef.primary) col += ' PRIMARY KEY';
    if (fDef.autoincrement) col += ' AUTOINCREMENT';
    if (fDef.notNull) col += ' NOT NULL';
    if (fDef.unique) col += ' UNIQUE';
    if (fDef.default) col += ` DEFAULT ${fDef.default}`;
    cols.push(col);
  }
  sqlLines.push(`CREATE TABLE IF NOT EXISTS ${def.table} (`, '  ' + cols.join(',\n  '), ');', '');
}
fs.writeFileSync(path.join(backendOutDir, 'schema.sql'), sqlLines.join('\n'));

console.log('Generated backend types, schema, and SQL in', backendOutDir);
console.log('Generated frontend types in', frontendOutDir);
