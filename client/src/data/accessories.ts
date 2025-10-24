export interface Accessory {
  id: string;
  name: string;
  category: "hat" | "glasses" | "jewelry" | "wings";
  imageUrl: string;
}

export const accessories: Accessory[] = [
  // Hats (6 items)
  { id: "bunny-ears", name: "Bunny Ears", category: "hat", imageUrl: "https://placehold.co/150x150/ff6b6b/white?text=Bunny+Ears" },
  { id: "top-hat", name: "Top Hat", category: "hat", imageUrl: "https://placehold.co/150x150/333333/white?text=Top+Hat" },
  { id: "baseball-cap", name: "Baseball Cap", category: "hat", imageUrl: "https://placehold.co/150x150/339af0/white?text=Cap" },
  { id: "beanie", name: "Beanie", category: "hat", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Beanie" },
  { id: "crown", name: "Sparkle Crown", category: "hat", imageUrl: "https://placehold.co/150x150/f0e68c/white?text=Crown" },
  { id: "witch-hat", name: "Witch Hat", category: "hat", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Witch" },

  // Glasses (6 items)
  { id: "star-glasses", name: "Star Glasses", category: "glasses", imageUrl: "https://placehold.co/150x150/22d3ee/white?text=Star" },
  { id: "sunglasses", name: "Sunglasses", category: "glasses", imageUrl: "https://placehold.co/150x150/333333/white?text=Sunglasses" },
  { id: "round-glasses", name: "Round Glasses", category: "glasses", imageUrl: "https://placehold.co/150x150/ff6b6b/white?text=Round" },
  { id: "heart-glasses", name: "Heart Glasses", category: "glasses", imageUrl: "https://placehold.co/150x150/f06595/white?text=Heart" },
  { id: "nerd-glasses", name: "Nerd Glasses", category: "glasses", imageUrl: "https://placehold.co/150x150/333333/white?text=Nerd" },
  { id: "cat-eye-glasses", name: "Cat Eye Glasses", category: "glasses", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Cat+Eye" },

  // Jewelry (6 items)
  { id: "heart-necklace", name: "Heart Necklace", category: "jewelry", imageUrl: "https://placehold.co/150x150/f06595/white?text=Heart" },
  { id: "gold-chain", name: "Gold Chain", category: "jewelry", imageUrl: "https://placehold.co/150x150/ffd700/white?text=Chain" },
  { id: "pearl-necklace", name: "Pearl Necklace", category: "jewelry", imageUrl: "https://placehold.co/150x150/f5f5dc/white?text=Pearl" },
  { id: "star-pendant", name: "Star Pendant", category: "jewelry", imageUrl: "https://placehold.co/150x150/22d3ee/white?text=Star" },
  { id: "gem-necklace", name: "Gem Necklace", category: "jewelry", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Gem" },
  { id: "bow-tie", name: "Bow Tie", category: "jewelry", imageUrl: "https://placehold.co/150x150/ff6b6b/white?text=Bow" },

  // Wings (6 items)
  { id: "fairy-wings", name: "Fairy Wings", category: "wings", imageUrl: "https://placehold.co/150x150/51cf66/white?text=Fairy" },
  { id: "angel-wings", name: "Angel Wings", category: "wings", imageUrl: "https://placehold.co/150x150/f5f5f5/white?text=Angel" },
  { id: "dragon-wings", name: "Dragon Wings", category: "wings", imageUrl: "https://placehold.co/150x150/ff6b6b/white?text=Dragon" },
  { id: "butterfly-wings", name: "Butterfly Wings", category: "wings", imageUrl: "https://placehold.co/150x150/f06595/white?text=Butterfly" },
  { id: "bat-wings", name: "Bat Wings", category: "wings", imageUrl: "https://placehold.co/150x150/333333/white?text=Bat" },
  { id: "rainbow-wings", name: "Rainbow Wings", category: "wings", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Rainbow" },
];

// Accessory color mapping (uses same colors as clothing)
export const accessoryColorMap: Record<string, string> = {
  red: "#ff6b6b",
  green: "#51cf66",
  blue: "#339af0",
  pink: "#f06595",
  purple: "#9775fa",
  cyan: "#22d3ee",
  black: "#333333",
  yellow: "#ffd700",
  white: "#f5f5f5",
};

// Available colors for accessories (extended palette)
export const accessoryColors = [
  { name: "pink", hex: "#f06595" },
  { name: "cyan", hex: "#22d3ee" },
  { name: "yellow", hex: "#ffd700" },
  { name: "purple", hex: "#9775fa" },
  { name: "green", hex: "#51cf66" },
  { name: "black", hex: "#333333" },
];
