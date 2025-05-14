/**
 * Maps team names to their corresponding logo filenames
 * This makes it easier to maintain logos and handle special cases
 */

interface TeamLogoMap {
  [teamName: string]: string;
}

/**
 * Explicit mappings for team names to logo filenames
 * Key: Exact team name as it appears in the standings
 * Value: Corresponding logo filename (without path or extension)
 */
export const teamLogoMap: TeamLogoMap = {
  
  // Indonesian League teams
  'Germanesia': 'germanesia',
  'B-One': 'b_one',
  'GWN FC': 'gwn_fc',
  'Funball': 'funball',
  'Siliwangi': 'siliwangi',
  'Bandung Mengbal': 'bandung_mengbal',
  'Ilgie Parahyangan': 'ilgie_parahyangan',
  'World Young United': 'world_young_united',
  'Norden Cub': 'norden_cub',
  'Apookat United': 'apookat_united',
  'Victory': 'victory',
  'Bungas Sav\'hil': 'bungas_savhil',
  'Andir United': 'andir_united',
  'Expose': 'expose'
};

/**
 * Gets the logo filename for a team name
 * @param teamName The exact team name
 * @returns The complete logo filename including extension
 */
export function getTeamLogoFilename(teamName: string): string {
  if (!teamName) return 'default.png';
  
  // First check if there's an explicit mapping
  if (teamLogoMap[teamName]) {
    return `${teamLogoMap[teamName]}.png`;
  }
  
  // Fallback to auto-generated filename
  const cleanName = teamName
    .toLowerCase()
    .replace(/[']/g, '')
    .replace(/[-]/g, '_')
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  
  return `${cleanName}.png`;
} 