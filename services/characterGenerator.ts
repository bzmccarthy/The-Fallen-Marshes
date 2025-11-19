import { Character, AbilityScores, Gender } from '../types';
import { NAMES, OCCUPATIONS, STARTER_PACKAGES, ARCANA } from '../data/oddData';

const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

const rollStat = () => rollDie(6) + rollDie(6) + rollDie(6);

const rollArcanum = (): { name: string, description: string } => {
  const d6_1 = rollDie(6);
  const d6_2 = rollDie(6);
  // d66 logic: first die is tens, second is units
  const result = parseInt(`${d6_1}${d6_2}`);
  return ARCANA[result] || { name: "Unknown Arcanum", description: "A mysterious object." };
};

const getStarterRow = (highest: number): number => {
  if (highest <= 9) return 3;
  return highest;
};

const parseName = (namePair: string, gender: Gender): string => {
  const parts = namePair.split('/');
  if (parts.length === 1) return parts[0];

  const maleName = parts[0];
  const suffixOrFemale = parts[1];

  // Logic: If gender is Male, return part 0
  if (gender === 'Male') return maleName;

  // If gender is Female
  if (gender === 'Female') {
    // Check if suffix starts with uppercase (replacement) or lowercase (append)
    if (suffixOrFemale[0] === suffixOrFemale[0].toUpperCase()) {
      return suffixOrFemale;
    } else {
      return maleName + suffixOrFemale;
    }
  }

  // If Random, pick one
  return Math.random() > 0.5 ? parseName(namePair, 'Male') : parseName(namePair, 'Female');
};

export const generateCharacter = (selectedGender: Gender = 'Random'): Character => {
  // 1. Roll Ability Scores
  const abilities: AbilityScores = {
    STR: rollStat(),
    DEX: rollStat(),
    WIL: rollStat(),
  };

  const highestStat = Math.max(abilities.STR, abilities.DEX, abilities.WIL);

  // 2. Roll HP
  const hp = rollDie(6);

  // 3. Starter Package
  const row = getStarterRow(highestStat);
  const packageString = STARTER_PACKAGES[row]?.[hp] || "Simple weapon (d6)";
  
  // Parse package string
  let equipment = packageString.split(',').map(s => s.trim());
  let arcanum = undefined;
  let oddity = undefined;

  // Handle Arcanum in package
  const arcanumIndex = equipment.findIndex(item => item.toLowerCase().includes('arcanum'));
  if (arcanumIndex !== -1) {
    arcanum = rollArcanum();
    // Replace the word "Arcanum" with the actual item name in equipment list
    equipment[arcanumIndex] = `${arcanum.name}`;
  }

  // 4. Wealth
  const wealth = rollDie(6);

  // 5. Gender & Name
  const finalGender: Gender = selectedGender === 'Random' 
    ? (Math.random() > 0.5 ? 'Male' : 'Female') 
    : selectedGender;
    
  const namePair = NAMES.pairs[Math.floor(Math.random() * NAMES.pairs.length)];
  const forename = parseName(namePair, finalGender);
  const surname = NAMES.surnames[Math.floor(Math.random() * NAMES.surnames.length)];
  const name = `${forename} ${surname}`;

  // 6. Occupation
  const occData = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];

  // Simple heuristic to find "oddities" or features in the equipment list for the prompt
  const potentialOddities = ["Burnt Face", "Lost Eye", "Prosthetic Hand", "Glowing Eyes", "Artificial Lung", "Prosthetic Leg", "No Nose", "Ugly Mutation", "One Arm", "Disfigured", "Mute"];
  
  equipment.forEach(item => {
      potentialOddities.forEach(po => {
          if (item.toLowerCase().includes(po.toLowerCase())) {
              oddity = po;
          }
      })
  });

  return {
    name,
    gender: finalGender,
    occupation: occData.name,
    capability: occData.capability,
    abilities,
    hp,
    wealth,
    equipment,
    arcanum,
    oddity,
    description: `A ${finalGender.toLowerCase()} ${occData.name} (${occData.capability}). Wields ${equipment.slice(0, 2).join(', ')}.`
  };
};