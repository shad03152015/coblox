export interface ClothingItem {
  id: string;
  name: string;
  category: "shirt" | "pants" | "shoes";
  imageUrl: string;
}

export const clothingItems: ClothingItem[] = [
  // Shirts (8 items)
  { id: "tshirt", name: "Basic T-Shirt", category: "shirt", imageUrl: "https://placehold.co/150x150/339af0/white?text=T-Shirt" },
  { id: "plaid-shirt", name: "Plaid Shirt", category: "shirt", imageUrl: "https://placehold.co/150x150/ff6b6b/white?text=Plaid" },
  { id: "hoodie", name: "Hoodie", category: "shirt", imageUrl: "https://placehold.co/150x150/51cf66/white?text=Hoodie" },
  { id: "polo", name: "Polo Shirt", category: "shirt", imageUrl: "https://placehold.co/150x150/f06595/white?text=Polo" },
  { id: "jacket", name: "Leather Jacket", category: "shirt", imageUrl: "https://placehold.co/150x150/333333/white?text=Jacket" },
  { id: "striped-shirt", name: "Striped Shirt", category: "shirt", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Striped" },
  { id: "denim-shirt", name: "Denim Shirt", category: "shirt", imageUrl: "https://placehold.co/150x150/339af0/white?text=Denim" },
  { id: "button-up", name: "Button-Up Shirt", category: "shirt", imageUrl: "https://placehold.co/150x150/22d3ee/white?text=Button" },

  // Pants (6 items)
  { id: "jeans", name: "Classic Jeans", category: "pants", imageUrl: "https://placehold.co/150x150/339af0/white?text=Jeans" },
  { id: "cargo-pants", name: "Cargo Pants", category: "pants", imageUrl: "https://placehold.co/150x150/51cf66/white?text=Cargo" },
  { id: "chinos", name: "Chinos", category: "pants", imageUrl: "https://placehold.co/150x150/f06595/white?text=Chinos" },
  { id: "joggers", name: "Joggers", category: "pants", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Joggers" },
  { id: "shorts", name: "Shorts", category: "pants", imageUrl: "https://placehold.co/150x150/22d3ee/white?text=Shorts" },
  { id: "dress-pants", name: "Dress Pants", category: "pants", imageUrl: "https://placehold.co/150x150/333333/white?text=Dress" },

  // Shoes (6 items)
  { id: "sneakers", name: "Sneakers", category: "shoes", imageUrl: "https://placehold.co/150x150/339af0/white?text=Sneakers" },
  { id: "boots", name: "Boots", category: "shoes", imageUrl: "https://placehold.co/150x150/333333/white?text=Boots" },
  { id: "sandals", name: "Sandals", category: "shoes", imageUrl: "https://placehold.co/150x150/22d3ee/white?text=Sandals" },
  { id: "dress-shoes", name: "Dress Shoes", category: "shoes", imageUrl: "https://placehold.co/150x150/333333/white?text=Dress" },
  { id: "high-tops", name: "High-Tops", category: "shoes", imageUrl: "https://placehold.co/150x150/ff6b6b/white?text=HighTops" },
  { id: "loafers", name: "Loafers", category: "shoes", imageUrl: "https://placehold.co/150x150/9775fa/white?text=Loafers" },
];

// Color mapping for avatar preview
export const colorMap: Record<string, string> = {
  red: "#ff6b6b",
  green: "#51cf66",
  blue: "#339af0",
  pink: "#f06595",
  purple: "#9775fa",
  cyan: "#22d3ee",
  black: "#333333",
};

// Available colors for selection
export const availableColors = [
  { name: "red", hex: "#ff6b6b" },
  { name: "green", hex: "#51cf66" },
  { name: "blue", hex: "#339af0" },
  { name: "pink", hex: "#f06595" },
  { name: "purple", hex: "#9775fa" },
  { name: "cyan", hex: "#22d3ee" },
  { name: "black", hex: "#333333" },
];
