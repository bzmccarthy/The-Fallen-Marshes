// Data transcribed from Into the Odd rules

// Format: "MaleName/FemaleSuffixOrReplacement"
// If suffix is lowercase (e.g. "Augost/a"), append to male name -> "Augosta"
// If suffix is capitalized (e.g. "Brin/Breen"), replace male name -> "Breen"
export const NAMES = {
  pairs: [
    "Augost/a", "Benedict/a", "Brin/Breen", "Chumwan/Chumwel", "Calahed/Calit", "Dorren/Dorret",
    "Emmett/Emma", "Felix/Felora", "Fred/Freda", "Grobin/a", "Gizard/Giza", "Helroff/Helriel",
    "Istan/Isti", "Ilmer/Ilda", "Junas/Julia", "Katsun/Katsin", "Lurpax/Lunda", "Litton/a",
    "Munfud/Munfi", "Narmun/Nadya", "Orren/a", "Podder/Poddin", "Peta", "Picklow/Pickelle",
    "Pipp/ita", "Quinn", "Rosher/Roshel", "Stellan/Stella", "Samford/Sambay", "Tucker/Tuckis",
    "Teevan/Teeva", "Urntin/Urna", "Varran/Varin", "Vanis/sa", "Volta/Voltel", "Weckster/Weckin",
    "Yurnak/Yurna", "Zarm/Zarrack"
  ],
  surnames: [
    "Allane", "Bargroll", "Brunfield", "Chop", "Creed", "Dunbell", "Eggler", "Fox", "Farsee", "Gill",
    "Gullwin", "Huckle", "Horrican", "Ingle", "Jongler", "Kross", "Lix", "Lowbile", "Montane", "Nutbush",
    "Olifant", "Offenpot", "Ouze", "Phile", "Parfait", "Quigley", "Regal", "Stagger", "Shark", "Tumble",
    "Terrine", "Underhog", "Upperill", "Volfhole", "Vinifera", "Wickerspin", "Yarn", "Zarrack"
  ]
};

export const OCCUPATIONS = [
  { name: "Actor", capability: "Anal-Retentive" },
  { name: "Barge Pilot", capability: "Boringly Dependable" },
  { name: "Butler", capability: "Best in the City" },
  { name: "Coffee House Host", capability: "Cheap and Dirty" },
  { name: "Coal Miner", capability: "Charming and Oily" },
  { name: "Dog Breeder", capability: "Dabbler" },
  { name: "Engine Cleaner", capability: "Expensive and Flashy" },
  { name: "Fist Fighter", capability: "Fair and Down to Earth" },
  { name: "Fishmonger", capability: "Filthy but very cheap" },
  { name: "Gull-Catcher", capability: "Great, but hated for it" },
  { name: "Glue Maker", capability: "Good but Annoying" },
  { name: "Gunsmith", capability: "Highly Artistic" },
  { name: "Gin-Maker", capability: "Hardly Trained" },
  { name: "Hog-Slaughterer", capability: "Inherited Family Trade" },
  { name: "Ivory Worker", capability: "Interested in new career" },
  { name: "Jeweler", capability: "Imposter" },
  { name: "Lower-Politician", capability: "Jealous of Better Rival" },
  { name: "Life Servant", capability: "Learning, still" },
  { name: "Lamp-Lighter", capability: "Loves the job" },
  { name: "Lesser-Noble", capability: "Lazy and Greedy" },
  { name: "Mercenary", capability: "Money-Grabbing" },
  { name: "Newspaper Vendor", capability: "Moral, but not that good" },
  { name: "Octopus-Catcher", capability: "Only serves friends" },
  { name: "Oyster Seller", capability: "Old-Master-Trained" },
  { name: "Perfumer", capability: "Perfectionist" },
  { name: "Professor", capability: "Paragon of the Job" },
  { name: "Prison Guard", capability: "Poor from bad business" },
  { name: "Pie-Smith", capability: "Retired from Injury" },
  { name: "Road Sweeper", capability: "Ruthless" },
  { name: "Salt Farmer", capability: "Sworn into Profession" },
  { name: "Sweet-Maker", capability: "Silently Dutiful" },
  { name: "Trinket-Merchant", capability: "Trained from Birth" },
  { name: "Tax Collector", capability: "Trapped in Job" },
  { name: "Tunnel Digger", capability: "Uncaring" },
  { name: "Whaler", capability: "Unreliable Genius" },
  { name: "Watchmaker", capability: "Wedded into Career" },
  { name: "Watchman", capability: "Wasted Talent" },
  { name: "Writer", capability: "Warm and Friendly" },
  { name: "Wigmaker", capability: "Wealthy with Success" }
];

export const ARCANA: Record<number, { name: string, description: string }> = {
  11: { name: "Gatekeeper’s Sigil", description: "Create a gate between two flat surfaces that you can see." },
  12: { name: "Pierced Heart", description: "Indicates direction and vague distance of an object you desire." },
  13: { name: "Pale Flame", description: "Object glows with white light. Contact causes chilling pain." },
  14: { name: "Soul Chain", description: "Target loses d6 WIL and you glimpse their desire." },
  15: { name: "Gavel of the Unbreakable Seal", description: "One door or window is sealed until you open it." },
  16: { name: "Foul Censer", description: "Green smoke surrounds you. Missiles cannot pass through." },
  21: { name: "Bleeding Stave", description: "Spews blood-like oil. DEX Save to avoid falling." },
  22: { name: "Pain Idol", description: "Roll a die. Odd: lose STR. Even: target loses STR." },
  23: { name: "Webbed Hands", description: "Climb sheer surfaces as if you were a spider." },
  24: { name: "Sunblessed Bands", description: "Glow and hum. Attackers suffer damage equal to what they deal." },
  25: { name: "Flesh-Tome of Babble", description: "Speak strange language. Every living thing understands." },
  26: { name: "Tyrant’s Rod", description: "Order a target to drop, fall, flee or halt." },
  31: { name: "Black Veil", description: "Target blinded until curse lifted or they Rest." },
  32: { name: "Strands of Suffering", description: "Strands spread between surfaces. Movement causes pain." },
  33: { name: "Heat Ray", description: "Metal object becomes too hot to touch. d8 Damage." },
  34: { name: "Miniaturisation Coil", description: "Touch an object to shrink it into a tiny miniature." },
  35: { name: "Frozen Cloud", description: "Floats at will. d6 Damage and cannot move within." },
  36: { name: "Many Phase Key", description: "Phase through a wall or floor with objects." },
  41: { name: "Skull Magnet", description: "Attract or repel a single target with a boney skull." },
  42: { name: "Transreal Mirror", description: "Create a perfect duplicate of you that acts independently." },
  43: { name: "Gorger’s Mask", description: "Wearer can consume anything safely." },
  44: { name: "Tomb Box", description: "Contains three tiny skeletons that obey the holder." },
  45: { name: "Howling Lantern", description: "Blowing causes roar that terrifies prey but attracts predators." },
  46: { name: "Rainbow Blade", description: "Sword (d6) fires harmless light beam." },
  51: { name: "Hawk of Prosperity", description: "Mechanical bird helps accumulate wealth. Eats 1s/day." },
  52: { name: "Inquisitor’s Hood", description: "Target must answer truthfully or you blurt inconvenient truth." },
  53: { name: "Winter’s Sickle", description: "Damage causes cold/deprivation until warmed." },
  54: { name: "Grief Cup", description: "Drinker has upsetting visions of past actions." },
  55: { name: "Victory Globe", description: "Guides you to oath fulfillment. Punishes failure." },
  56: { name: "Moon Lens", description: "Highlights object that best answers a question." },
  61: { name: "Fool’s Coin", description: "Others crave this coin. Effect lasts an hour." },
  62: { name: "Chance Rose", description: "Crush to set odds of success to 50%." },
  63: { name: "Homing Stick", description: "Staff that flies back to you." },
  64: { name: "False Platter", description: "Viewer sees illusion of luxury they crave." },
  65: { name: "Gold Visor", description: "Visualize honesty and sincerity of speaker." },
  66: { name: "Infinity Icon", description: "Stop time, but can only observe and think." }
};

export const STARTER_PACKAGES: Record<number, Record<number, string>> = {
  3: { // 3-9
    1: "Sword (d6), Pistol (d6), Modern Armour, Sense nearby unearthly beings",
    2: "Musket (d8 B), Sword (d6), Flashbang, Sense nearby Arcana",
    3: "Musket (d8 B), Club (d6), Immunity to extreme heat and cold",
    4: "Pistol (d6), Knife (d6), Telepathy if target fails WIL Save",
    5: "Blunderbuss (d8 B), Hatchet (d6), Mutt, Dreams show your undiscovered surroundings",
    6: "Musket (d8 B), Hatchet (d6), Flashbang, Arcanum, Iron Limb"
  },
  10: {
    1: "Rifle (d8 B), Bayonet (d6), Lighter Boy, Arcanum",
    2: "Musket (d8 B), Hatchet (d6), Hawk, Arcanum",
    3: "Musket (d8 B), Protective Gloves, Arcanum",
    4: "Claymore (d8 B), Pistol (d6), 2 Acid Flasks, Arcanum",
    5: "Brace of Pistols (d8 B), Steel Wire, Grappling Hook, Arcanum",
    6: "Rifle (d8 B), Mace (d6), Eagle, Poison"
  },
  11: {
    1: "Rifle (d8 B), Modern Armour, Hound, Arcanum",
    2: "Hatchet (d6), Pistol (d6), Bolt-Cutters, Arcanum",
    3: "Musket (d8 B), Mallet, Marbles, Fancy Hat, Arcanum",
    4: "Musket (d8 B), Bayonet (d6), Mutt with telepathic link",
    5: "Machete (d6), Brace of Pistols (d8 B), Talking Parrot, Never Sleep",
    6: "Club (d6), 3 Bombs, Rocket, Darkvision"
  },
  12: {
    1: "Club (d6), Throwing Knives, Arcanum",
    2: "Musket (d8 B), Mule, Arcanum",
    3: "Pick-Axe (d6), Manacles, Arcanum",
    4: "Pistol (d6), Rocket, Toxin-Immune",
    5: "Harpoon Gun (d8 B), Baton (d6), Acid, Slightly Magnetic",
    6: "Maul (d8 B), Dagger (d6), Chain"
  },
  13: {
    1: "Pistol (d6), Ether, Poison, Arcanum",
    2: "Sword (d6), Pistol (d6), Crude Armour",
    3: "Pistol (d6), Smoke-bomb, Mutt, Shovel",
    4: "Musket (d8 B), Portable Ram, Game Set",
    5: "Bolt-Cutters, Blunderbuss (d8 B), Fiddle",
    6: "Longaxe (d8 B), Rum, Bomb"
  },
  14: {
    1: "Cane (d6), Acid, Spyglass, Arcanum",
    2: "Pistol (d6), Bell, Steel Wire, Smoke-bomb",
    3: "Longaxe (d8 B), Throwing Axes, Fire Oil",
    4: "Pistol (d6), Saw, Animal Trap, Spyglass",
    5: "Pistol (d6), Grease, Hand Drill, Drum",
    6: "Dagger (d6), Fire Oil, Mirror"
  },
  15: {
    1: "Brace of Pistols (d8 B), Canary, Ether",
    2: "Longaxe (d8 B), Ferret, Fire Oil",
    3: "Club (d6), Ether, Crowbar, Flute",
    4: "Bow (d6 B), Knife (d6), Rocket, Fire Oil",
    5: "Sword & Dagger (d8 B), Magnifying Glass, Lost Eye",
    6: "Pistol (d6), Knife (d6), Bomb, Saw"
  },
  16: {
    1: "Musket (d8 B), Pocket-watch, Bomb",
    2: "Staff (d6 B), Tongs, Glue",
    3: "Hatchet (d6), Net, Fire Oil, Burnt Face",
    4: "Pistol (d6), Whip (d6), Cigars, Lost Eye",
    5: "Pistol (d6), Acid, Animal Repellent, Prosthetic Hand",
    6: "Pistol (d6), Bomb, Shovel, Glowing Eyes"
  },
  17: {
    1: "Halberd (d8 B), Fake Pistol, Artificial Lung",
    2: "Pistol (d6), Net, Trumpet, Prosthetic Leg",
    3: "Club (d6), Paint, Crowbar, Loud Lungs",
    4: "Musket (d8 B), Accordion, No Nose/Scent",
    5: "Sword (d6), Steel Wire, Ugly Mutation",
    6: "Staff (d6 B), Throwing Knives (d6)"
  },
  18: {
    1: "Garotte (d6), Musket (d8 B), Mute",
    2: "Pistol (d6), Grease, Hacksaw, One Arm",
    3: "Pistol (d6), Cigars, Poison, Fugitive",
    4: "Sword (d6), Shield, Illiterate",
    5: "Sword (d6), Ferret, Tattered Clothes, Debt (3G)",
    6: "Mace (d6), Pigeon, Disfigured"
  }
};