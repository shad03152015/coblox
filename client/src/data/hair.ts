export interface HairBaseStyle {
  id: string;
  name: string;
  imageUrl: string;
}

export interface HairElement {
  id: string;
  name: string;
  imageUrl: string;
}

export const hairBaseStyles: HairBaseStyle[] = [
  { id: "short-messy", name: "Short Messy", imageUrl: "https://placehold.co/150x150/339af0/white?text=Short+Messy" },
  { id: "long-wavy", name: "Long Wavy", imageUrl: "https://placehold.co/150x150/ff6b6b/white?text=Long+Wavy" },
  { id: "slicked-back", name: "Slicked Back", imageUrl: "https://placehold.co/150x150/51cf66/white?text=Slicked" },
  { id: "top-bun", name: "Top Bun", imageUrl: "https://placehold.co/150x150/f06595/white?text=Top+Bun" },
  { id: "spiky", name: "Spiky", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Spiky" },
  { id: "ponytail", name: "Ponytail", imageUrl: "https://placehold.co/150x150/22d3ee/white?text=Ponytail" },
];

export const hairElements: HairElement[] = [
  { id: "bangs", name: "Bangs", imageUrl: "https://placehold.co/150x150/339af0/white?text=Bangs" },
  { id: "braids", name: "Braids", imageUrl: "https://placehold.co/150x150/ff6b6b/white?text=Braids" },
  { id: "clips", name: "Clips", imageUrl: "https://placehold.co/150x150/51cf66/white?text=Clips" },
  { id: "hairband", name: "Hairband", imageUrl: "https://placehold.co/150x150/f06595/white?text=Hairband" },
  { id: "feathers", name: "Feathers", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Feathers" },
];

// Hair color mapping (uses same colors as clothing)
export const hairColorMap: Record<string, string> = {
  red: "#ff6b6b",
  green: "#51cf66",
  blue: "#339af0",
  pink: "#f06595",
  purple: "#9775fa",
  cyan: "#22d3ee",
  black: "#333333",
};
