/**
 * This script copies team logos from their actual filenames to the
 * normalized filenames used in the application.
 * 
 * Run with: node scripts/copyTeamLogos.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory where team logos are stored
const LOGO_DIR = path.join(__dirname, '../public/img/logo');

// Get the list of existing logo files
const existingFiles = fs.readdirSync(LOGO_DIR);

// Load the team logo map
const teamLogoMapContent = fs.readFileSync(
  path.join(__dirname, '../utils/teamLogos.ts'),
  'utf8'
);

// Extract the team logo map as a JavaScript object
const teamLogoMapMatch = teamLogoMapContent.match(/export const teamLogoMap: TeamLogoMap = ({[\s\S]*?});/);
if (!teamLogoMapMatch) {
  console.error('Could not find teamLogoMap in the file.');
  process.exit(1);
}

// Parse the map content
const teamLogoMapString = teamLogoMapMatch[1].replace(/'/g, '"');
// Convert the map string to a JavaScript object
const teamLogoMap = {};
// Extract key-value pairs manually
const pairs = teamLogoMapString.match(/'[^']*':\s*'[^']*'/g) || [];
pairs.forEach(pair => {
  const [key, value] = pair.split(':').map(s => s.trim().replace(/^'|'$/g, ''));
  teamLogoMap[key] = value;
});

console.log(`Found ${Object.keys(teamLogoMap).length} team mappings in teamLogos.ts`);

// Copy existing files to their mapped names if needed
let copied = 0;
let missing = 0;

// Check for any missing logo files
Object.entries(teamLogoMap).forEach(([teamName, logoName]) => {
  const targetFilename = `${logoName}.png`;
  
  // Check if the file already exists with the target name
  if (existingFiles.includes(targetFilename)) {
    console.log(`✓ ${targetFilename} already exists`);
    return;
  }
  
  // Check if the file exists with the original team name
  const originalFilename = `${teamName}.png`;
  if (existingFiles.includes(originalFilename)) {
    // Copy the file to the mapped name
    fs.copyFileSync(
      path.join(LOGO_DIR, originalFilename),
      path.join(LOGO_DIR, targetFilename)
    );
    console.log(`✓ Copied ${originalFilename} to ${targetFilename}`);
    copied++;
    return;
  }
  
  // Logo doesn't exist with either name
  console.log(`✕ Missing logo for ${teamName} (${targetFilename})`);
  missing++;
});

console.log(`\nSummary:`);
console.log(`- ${copied} logos copied to normalized filenames`);
console.log(`- ${missing} logos are missing`);
console.log(`- ${existingFiles.length} total logo files in directory`); 