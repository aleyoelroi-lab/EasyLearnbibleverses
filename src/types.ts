export type GameStageId = 
  | 'title'
  | 'character_select'
  | 'prologue_call'        // Sanctuary Village (John 3:16)
  | 'stage1_talents'       // Wilderness of Stewardship (Matthew 25:14-30)
  | 'stage2_confession'    // Valley of the Hidden Treasure (Matthew 13:44)
  | 'stage3_midnight'      // Mount of Midnight Vigil & Dragon (Matthew 25:6, Rev 19)
  | 'epilogue_word'        // The Word Made Flesh & Feast (John 1:1, 1:14)
  | 'end_times_battle'     // Revelation 19 Heavenly Battle with King on White Horse
  | 'tomb_old_age'         // 1-Hour Lifespan Waiting for the Lord's Return
  | 'game_over'
  | 'victory';

export type WeatherType = 'peaceful_day' | 'evening_rain' | 'midnight_storm' | 'celestial_dawn';

export interface SoulPerson {
  id: string;
  name: string;
  title: string;
  locationDescription: string;
  x: number;
  y: number;
  symbol: string;
  avatarColor: string;
  robeColor: string;
  initialQuestion: string;
  initialScripture: string;
  initialScriptureRef: string;
  doubtExplanation: string;
  deeperScriptureRef: string;
  deeperScriptureText: string;
  deeperExplanation: string;
  status: 'unreached' | 'questioning' | 'believed';
  seedPlanted: boolean;
  plantGrowth: number; // 0 to 100
  plantName: string;
  plantFruit: string;
  isHardToWin?: boolean;      // Red soul: deeply hardened/skeptical, requires strong faith
  isRedTreeGrown?: boolean;   // Instantly grows to a tree of righteousness upon belief
  isConvertedHelper?: boolean;// Consecrated helper serving with the player (no wings, like angel job)
  isDiscipleFollowing?: boolean; // Currently walking with the player as an active Disciple
  isShepherd?: boolean;       // Converted into an independent Shepherd wandering the sanctuary pastures after 1 demon battle
}

export interface GardenPlant {
  soulId: string;
  soulName: string;
  plantName: string;
  growthStage: 'seed' | 'sprout' | 'blooming' | 'celestial_fruit';
  growthProgress: number; // 0 to 100
  seedDate: string;
  fruitDesc: string;
}

export interface BrideCharacter {
  id: string;
  name: string;
  title: string;
  temperament: string;
  symbol: string;
  verseAnchor: string;
  color: string;
  secondaryColor: string;
  accentColor: string;
  description: string;
  spiritualPerk: string;
  baseOilDrainRate: number;
  lightRadiusBonus: number;
  speedBonus: number;
  faithMultiplier: number;
  baseAttack: number;
  baseWisdom: number;
  baseSp: number;
}

export interface ScriptureReadAloud {
  id: string;
  name: string;
  verseRef: string;
  verseText: string;
  spCost: number;
  power: number;
  type: 'holy_damage' | 'heal' | 'buff_shield' | 'refill_oil';
  description: string;
  teaching: string;
  requiredLevel?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  iconName: string;
  type: 'oil' | 'heal' | 'sp' | 'key' | 'currency';
  description: string;
  effectValue: number;
}

export interface PlayerState {
  id: 1 | 2;
  bride: BrideCharacter;
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: 'up' | 'down' | 'left' | 'right';
  level: number;
  faithExp: number;
  nextLevelExp: number;
  health: number; // HP
  maxHealth: number;
  sp: number;     // Spirit Points for Scripture Read Aloud
  maxSp: number;
  oil: number;    // 0 - 100
  maxOil: number;
  attack: number;
  wisdom: number;
  defense: number;
  isLanternLit: boolean;
  talentsCollected: number;
  landPurchased: boolean;
  confessedFaith: boolean;
  score: number;
  stepsWalked: number;
  isAlive: boolean;
  angelRescuesRemaining: number; // Max 3 times Angel of the Lord rescues player and subdues the demon
  activeHelpersCount: number;    // Count of converted Red Souls who became earthly consecrated helpers
  darkAffliction?: 'lust_blindness' | 'pride_curse' | 'greed_cowardice' | 'sloth_lethargy' | null;
  inventory: InventoryItem[];
  scriptures: ScriptureReadAloud[];
}

export interface RPGEnemy {
  id: string;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  color: string;
  symbol: string;
  description: string;
  scriptureCounter: string;
  expReward: number;
  talentReward: number;
  isStrongRed?: boolean; // Strong red enemy with fierce aura & high challenges
}

export interface BattleState {
  active: boolean;
  enemy: RPGEnemy;
  turn: 'player' | 'enemy' | 'victory' | 'defeat' | 'animating';
  battleLog: string[];
  lastAction?: string;
  animatingAction?: string;
}

export interface DialogueNode {
  speaker: string;
  title?: string;
  text: string;
  scriptureRef?: string;
  portraitSymbol?: string;
  options?: {
    label: string;
    action?: () => void;
    nextDialogue?: string;
  }[];
}

export interface WorldObject {
  id: string;
  x: number;
  y: number;
  type: 
    | 'oil_vessel' 
    | 'scripture_altar' 
    | 'talent_chest' 
    | 'land_deed' 
    | 'hazard_fire' 
    | 'hazard_shadow' 
    | 'bride_companion' 
    | 'sanctuary_gate' 
    | 'npc_elder'
    | 'npc_merchant'
    | 'npc_soul_human'
    | 'mountain_prayer_room'
    | 'home_cottage'
    | 'home_garden'
    | 'enemy_shadow'
    | 'dragon_boss'
    | 'white_horse_king';
  name: string;
  collected?: boolean;
  dialogue?: DialogueNode;
  enemyData?: RPGEnemy;
  soulData?: SoulPerson;
  angelData?: any;
  data?: any;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  brideName: string;
  faithScore: number;
  stageReached: string;
  oilConserved: number;
  timeSurvivedSeconds: number;
  date: string;
  mode: 'Single' | 'Co-Op';
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  verseRef: string;
  verseText: string;
  completed: boolean;
  rewardFaith: number;
}
