export interface BodyType {
  id: string;
  name: string;
  imageUrl: string;
}

export interface SkinTone {
  id: string;
  name: string;
  hex: string;
}

export const bodyTypes: BodyType[] = [
  { id: "slim", name: "Slim", imageUrl: "https://placehold.co/150x200/339af0/white?text=Slim" },
  { id: "athletic", name: "Athletic", imageUrl: "https://placehold.co/150x200/ff6b6b/white?text=Athletic" },
  { id: "average", name: "Average", imageUrl: "https://placehold.co/150x200/51cf66/white?text=Average" },
  { id: "muscular", name: "Muscular", imageUrl: "https://placehold.co/150x200/9775fa/white?text=Muscular" },
];

export const skinTones: SkinTone[] = [
  { id: "light", name: "Light", hex: "#fde4cd" },
  { id: "fair", name: "Fair", hex: "#f1c6a7" },
  { id: "medium", name: "Medium", hex: "#d4a574" },
  { id: "tan", name: "Tan", hex: "#c4a57b" },
  { id: "brown", name: "Brown", hex: "#a67c52" },
  { id: "dark", name: "Dark", hex: "#754c24" },
];
