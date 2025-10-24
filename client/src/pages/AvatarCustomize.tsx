import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { AvatarPreview } from "@/components/AvatarPreview";
import { clothingItems, availableColors } from "@/data/clothing";
import { hairBaseStyles, hairElements } from "@/data/hair";
import { bodyTypes, skinTones } from "@/data/body";
import { accessories, accessoryColors } from "@/data/accessories";

type CategoryType = "clothing" | "body" | "hair" | "accessories";
type ClothingTabType = "shirts" | "pants" | "shoes";
type HairTabType = "base-styles" | "elements";
type AccessoriesTabType = "hats" | "glasses" | "jewelry" | "wings";

interface ClothingSelection {
  id: string;
  color: string;
}

interface BodySelection {
  type: string;
  skinTone: string;
}

interface HairSelection {
  baseStyle: string;
  elements: string[];
  color: string;
}

interface AccessoriesSelection {
  hat?: { id: string; color: string };
  glasses?: { id: string; color: string };
  jewelry?: { id: string; color: string };
  wings?: { id: string; color: string };
}

export default function AvatarCustomize() {
  const [, setLocation] = useLocation();

  // Category state
  const [currentCategory, setCurrentCategory] = useState<CategoryType>("clothing");

  // Clothing selections
  const [selectedShirt, setSelectedShirt] = useState<ClothingSelection>({
    id: "tshirt",
    color: "blue",
  });
  const [selectedPants, setSelectedPants] = useState<ClothingSelection>({
    id: "jeans",
    color: "blue",
  });
  const [selectedShoes, setSelectedShoes] = useState<ClothingSelection>({
    id: "sneakers",
    color: "black",
  });

  // Body selections
  const [selectedBody, setSelectedBody] = useState<BodySelection>({
    type: "average",
    skinTone: "tan",
  });

  // Hair selections
  const [selectedHair, setSelectedHair] = useState<HairSelection>({
    baseStyle: "short-messy",
    elements: [],
    color: "black",
  });

  // Accessories selections
  const [selectedAccessories, setSelectedAccessories] = useState<AccessoriesSelection>({});

  // UI state
  const [currentClothingTab, setCurrentClothingTab] = useState<ClothingTabType>("shirts");
  const [currentHairTab, setCurrentHairTab] = useState<HairTabType>("base-styles");
  const [currentAccessoriesTab, setCurrentAccessoriesTab] = useState<AccessoriesTabType>("hats");
  const [currentColor, setCurrentColor] = useState<string>("red");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Authentication check and load existing appearance on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to customize your avatar");
      setLocation("/");
      return;
    }

    // Fetch existing appearance
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/character/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && response.data.user.avatarAppearance) {
          const appearance = response.data.user.avatarAppearance;

          // Load clothing
          if (appearance.shirt) setSelectedShirt(appearance.shirt);
          if (appearance.pants) setSelectedPants(appearance.pants);
          if (appearance.shoes) setSelectedShoes(appearance.shoes);

          // Load body
          if (appearance.body) setSelectedBody(appearance.body);

          // Load hair
          if (appearance.hair) setSelectedHair(appearance.hair);

          // Load accessories
          if (appearance.accessories) setSelectedAccessories(appearance.accessories);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          setTimeout(() => setLocation("/"), 2000);
        }
        // If no appearance exists yet, that's fine - use defaults
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setLocation]);

  // Browser beforeunload handler for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle category switching
  const handleCategoryChange = (category: CategoryType) => {
    setCurrentCategory(category);
    setSearchQuery(""); // Reset search when switching categories
  };

  // Get filtered clothing items
  const getFilteredClothingItems = () => {
    let categoryItems = clothingItems.filter((item) => {
      if (currentClothingTab === "shirts") return item.category === "shirt";
      if (currentClothingTab === "pants") return item.category === "pants";
      if (currentClothingTab === "shoes") return item.category === "shoes";
      return false;
    });

    if (searchQuery.trim()) {
      categoryItems = categoryItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return categoryItems;
  };

  // Get filtered hair items
  const getFilteredHairItems = () => {
    const items = currentHairTab === "base-styles" ? hairBaseStyles : hairElements;

    if (searchQuery.trim()) {
      return items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  // Handle clothing tab change
  const handleClothingTabChange = (tab: ClothingTabType) => {
    setCurrentClothingTab(tab);
    setSearchQuery("");
  };

  // Handle hair tab change
  const handleHairTabChange = (tab: HairTabType) => {
    setCurrentHairTab(tab);
    setSearchQuery("");
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
  };

  // Handle clothing item selection
  const handleClothingItemSelect = (itemId: string) => {
    const selection = { id: itemId, color: currentColor };

    if (currentClothingTab === "shirts") {
      setSelectedShirt(selection);
    } else if (currentClothingTab === "pants") {
      setSelectedPants(selection);
    } else if (currentClothingTab === "shoes") {
      setSelectedShoes(selection);
    }

    setHasUnsavedChanges(true);
  };

  // Handle body type selection
  const handleBodyTypeSelect = (typeId: string) => {
    setSelectedBody({ ...selectedBody, type: typeId });
    setHasUnsavedChanges(true);
  };

  // Handle skin tone selection
  const handleSkinToneSelect = (toneId: string) => {
    setSelectedBody({ ...selectedBody, skinTone: toneId });
    setHasUnsavedChanges(true);
  };

  // Handle hair base style selection
  const handleHairBaseStyleSelect = (styleId: string) => {
    setSelectedHair({ ...selectedHair, baseStyle: styleId, color: currentColor });
    setHasUnsavedChanges(true);
  };

  // Handle hair element toggle
  const handleHairElementToggle = (elementId: string) => {
    const elements = selectedHair.elements.includes(elementId)
      ? selectedHair.elements.filter((e) => e !== elementId)
      : [...selectedHair.elements, elementId];

    setSelectedHair({ ...selectedHair, elements });
    setHasUnsavedChanges(true);
  };

  // Check if clothing item is selected
  const isClothingItemSelected = (itemId: string): boolean => {
    if (currentClothingTab === "shirts")
      return selectedShirt.id === itemId && selectedShirt.color === currentColor;
    if (currentClothingTab === "pants")
      return selectedPants.id === itemId && selectedPants.color === currentColor;
    if (currentClothingTab === "shoes")
      return selectedShoes.id === itemId && selectedShoes.color === currentColor;
    return false;
  };

  // Handle save and exit
  const handleSaveAndExit = async () => {
    setIsSaving(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      setLocation("/");
      return;
    }

    try {
      const response = await axios.patch(
        "/api/character/avatar",
        {
          avatarAppearance: {
            shirt: selectedShirt,
            pants: selectedPants,
            shoes: selectedShoes,
            body: selectedBody,
            hair: selectedHair,
            accessories: selectedAccessories,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Avatar saved successfully!");
        setHasUnsavedChanges(false);
        setTimeout(() => setLocation("/profile"), 500);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        setTimeout(() => setLocation("/"), 2000);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to save avatar. Please try again.");
      }
      setIsSaving(false);
    }
  };

  // Handle navigation with unsaved changes
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowExitModal(true);
    } else {
      setLocation(path);
    }
  };

  // Handle leave without saving
  const handleLeave = () => {
    setHasUnsavedChanges(false);
    setShowExitModal(false);
    if (pendingNavigation) {
      setLocation(pendingNavigation);
    }
  };

  // Get search placeholder
  const getSearchPlaceholder = () => {
    if (currentCategory === "clothing") {
      if (currentClothingTab === "shirts") return "Search for shirts...";
      if (currentClothingTab === "pants") return "Search for pants...";
      if (currentClothingTab === "shoes") return "Search for shoes...";
    } else if (currentCategory === "hair") {
      if (currentHairTab === "base-styles") return "Search for hair styles...";
      if (currentHairTab === "elements") return "Search for hair elements...";
    }
    return "Search...";
  };

  // Get title based on category
  const getTitle = () => {
    if (currentCategory === "clothing") return "Avatar Customization";
    if (currentCategory === "body") return "Stylist's Workbench";
    if (currentCategory === "hair") return "Stylist's Workbench";
    return "Avatar Customization";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0e27] flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] flex">
      {/* Left Sidebar */}
      <div className="w-24 bg-[#0d1230] border-r border-gray-800 flex flex-col items-center py-8 gap-6">
        {/* Clothing button */}
        <div
          className={`flex flex-col items-center gap-2 cursor-pointer ${
            currentCategory === "clothing" ? "" : "opacity-70"
          }`}
          onClick={() => handleCategoryChange("clothing")}
        >
          <div
            className={`w-14 h-14 rounded-lg flex items-center justify-center ${
              currentCategory === "clothing"
                ? "bg-[#00d9ff] bg-opacity-20 border-2 border-[#00d9ff]"
                : "bg-gray-700 border-2 border-gray-600"
            }`}
          >
            <svg
              className={`w-8 h-8 ${
                currentCategory === "clothing" ? "text-[#00d9ff]" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <span
            className={`text-xs font-medium ${
              currentCategory === "clothing" ? "text-[#00d9ff]" : "text-gray-400"
            }`}
          >
            Clothing
          </span>
        </div>

        {/* Body button */}
        <div
          className={`flex flex-col items-center gap-2 cursor-pointer ${
            currentCategory === "body" ? "" : "opacity-70"
          }`}
          onClick={() => handleCategoryChange("body")}
        >
          <div
            className={`w-14 h-14 rounded-lg flex items-center justify-center ${
              currentCategory === "body"
                ? "bg-[#00d9ff] bg-opacity-20 border-2 border-[#00d9ff]"
                : "bg-gray-700 border-2 border-gray-600"
            }`}
          >
            <svg
              className={`w-8 h-8 ${
                currentCategory === "body" ? "text-[#00d9ff]" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span
            className={`text-xs font-medium ${
              currentCategory === "body" ? "text-[#00d9ff]" : "text-gray-400"
            }`}
          >
            Body
          </span>
        </div>

        {/* Hair button */}
        <div
          className={`flex flex-col items-center gap-2 cursor-pointer ${
            currentCategory === "hair" ? "" : "opacity-70"
          }`}
          onClick={() => handleCategoryChange("hair")}
        >
          <div
            className={`w-14 h-14 rounded-lg flex items-center justify-center ${
              currentCategory === "hair"
                ? "bg-[#00d9ff] bg-opacity-20 border-2 border-[#00d9ff]"
                : "bg-gray-700 border-2 border-gray-600"
            }`}
          >
            <svg
              className={`w-8 h-8 ${
                currentCategory === "hair" ? "text-[#00d9ff]" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span
            className={`text-xs font-medium ${
              currentCategory === "hair" ? "text-[#00d9ff]" : "text-gray-400"
            }`}
          >
            Hair
          </span>
        </div>

        {/* Accessories button (disabled) */}
        <div className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
          <div className="w-14 h-14 rounded-lg bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
          <span className="text-gray-500 text-xs font-medium">Accessories</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Title */}
        <h1 className="text-5xl font-bold text-[#00d9ff] mb-6">{getTitle()}</h1>

        {/* Clothing Section */}
        {currentCategory === "clothing" && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button
                onClick={() => handleClothingTabChange("shirts")}
                className={`px-6 py-3 font-semibold transition-all ${
                  currentClothingTab === "shirts"
                    ? "text-[#00d9ff] border-b-3 border-[#00d9ff]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                style={{
                  borderBottomWidth: currentClothingTab === "shirts" ? "3px" : "0",
                  borderBottomColor: currentClothingTab === "shirts" ? "#00d9ff" : "transparent",
                }}
              >
                Shirts
              </button>
              <button
                onClick={() => handleClothingTabChange("pants")}
                className={`px-6 py-3 font-semibold transition-all ${
                  currentClothingTab === "pants"
                    ? "text-[#00d9ff] border-b-3 border-[#00d9ff]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                style={{
                  borderBottomWidth: currentClothingTab === "pants" ? "3px" : "0",
                  borderBottomColor: currentClothingTab === "pants" ? "#00d9ff" : "transparent",
                }}
              >
                Pants
              </button>
              <button
                onClick={() => handleClothingTabChange("shoes")}
                className={`px-6 py-3 font-semibold transition-all ${
                  currentClothingTab === "shoes"
                    ? "text-[#00d9ff] border-b-3 border-[#00d9ff]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                style={{
                  borderBottomWidth: currentClothingTab === "shoes" ? "3px" : "0",
                  borderBottomColor: currentClothingTab === "shoes" ? "#00d9ff" : "transparent",
                }}
              >
                Shoes
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md bg-[#0d1230] border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            {/* Color Filter */}
            <div className="mb-8">
              <h3 className="text-white font-bold text-lg mb-3">Color</h3>
              <div className="flex gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color.name)}
                    className={`w-12 h-12 rounded-full transition-all ${
                      currentColor === color.name
                        ? "ring-4 ring-white ring-opacity-80 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-3 gap-6">
              {getFilteredClothingItems().length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-400 text-lg">No items found. Try a different search.</p>
                </div>
              ) : (
                getFilteredClothingItems().map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleClothingItemSelect(item.id)}
                    className={`cursor-pointer rounded-lg p-4 transition-all ${
                      isClothingItemSelected(item.id)
                        ? "bg-[#00d9ff] bg-opacity-20 border-3 border-[#00d9ff]"
                        : "bg-[#0d1230] border-2 border-gray-700 hover:border-gray-500"
                    }`}
                    style={{
                      borderWidth: isClothingItemSelected(item.id) ? "3px" : "2px",
                    }}
                  >
                    <div
                      className="w-full aspect-square rounded-lg mb-3"
                      style={{
                        backgroundColor:
                          availableColors.find((c) => c.name === currentColor)?.hex || "#339af0",
                      }}
                    />
                    <p className="text-white text-center font-medium">{item.name}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Body Section */}
        {currentCategory === "body" && (
          <>
            {/* Body Type Selection */}
            <div className="mb-8">
              <h3 className="text-white font-bold text-xl mb-4">Body Type</h3>
              <div className="grid grid-cols-4 gap-6">
                {bodyTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleBodyTypeSelect(type.id)}
                    className={`cursor-pointer rounded-lg p-4 transition-all ${
                      selectedBody.type === type.id
                        ? "bg-[#00d9ff] bg-opacity-20 border-3 border-[#00d9ff]"
                        : "bg-[#0d1230] border-2 border-gray-700 hover:border-gray-500"
                    }`}
                    style={{
                      borderWidth: selectedBody.type === type.id ? "3px" : "2px",
                    }}
                  >
                    <div className="w-full aspect-[3/4] rounded-lg mb-3 bg-gray-600" />
                    <p className="text-white text-center font-medium">{type.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skin Tone Selection */}
            <div className="mb-8">
              <h3 className="text-white font-bold text-xl mb-4">Skin Tone</h3>
              <div className="flex gap-3">
                {skinTones.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => handleSkinToneSelect(tone.id)}
                    className={`w-16 h-16 rounded-full transition-all ${
                      selectedBody.skinTone === tone.id
                        ? "ring-4 ring-white ring-opacity-80 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: tone.hex }}
                    title={tone.name}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Hair Section */}
        {currentCategory === "hair" && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button
                onClick={() => handleHairTabChange("base-styles")}
                className={`px-6 py-3 font-semibold transition-all ${
                  currentHairTab === "base-styles"
                    ? "text-[#00d9ff] border-b-3 border-[#00d9ff]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                style={{
                  borderBottomWidth: currentHairTab === "base-styles" ? "3px" : "0",
                  borderBottomColor: currentHairTab === "base-styles" ? "#00d9ff" : "transparent",
                }}
              >
                Base Styles
              </button>
              <button
                onClick={() => handleHairTabChange("elements")}
                className={`px-6 py-3 font-semibold transition-all ${
                  currentHairTab === "elements"
                    ? "text-[#00d9ff] border-b-3 border-[#00d9ff]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                style={{
                  borderBottomWidth: currentHairTab === "elements" ? "3px" : "0",
                  borderBottomColor: currentHairTab === "elements" ? "#00d9ff" : "transparent",
                }}
              >
                Elements
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md bg-[#0d1230] border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            {/* Color Filter (only for base styles) */}
            {currentHairTab === "base-styles" && (
              <div className="mb-8">
                <h3 className="text-white font-bold text-lg mb-3">Color</h3>
                <div className="flex gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.name)}
                      className={`w-12 h-12 rounded-full transition-all ${
                        currentColor === color.name
                          ? "ring-4 ring-white ring-opacity-80 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hair Items Grid */}
            <div>
              {currentHairTab === "base-styles" && (
                <>
                  <h3 className="text-white font-bold text-xl mb-4">Hair Base Styles</h3>
                  <div className="grid grid-cols-3 gap-6">
                    {getFilteredHairItems().map((style: any) => (
                      <div
                        key={style.id}
                        onClick={() => handleHairBaseStyleSelect(style.id)}
                        className={`cursor-pointer rounded-lg p-4 transition-all ${
                          selectedHair.baseStyle === style.id && selectedHair.color === currentColor
                            ? "bg-[#00d9ff] bg-opacity-20 border-3 border-[#00d9ff]"
                            : "bg-[#0d1230] border-2 border-gray-700 hover:border-gray-500"
                        }`}
                        style={{
                          borderWidth:
                            selectedHair.baseStyle === style.id && selectedHair.color === currentColor
                              ? "3px"
                              : "2px",
                        }}
                      >
                        <div
                          className="w-full aspect-square rounded-lg mb-3"
                          style={{
                            backgroundColor:
                              availableColors.find((c) => c.name === currentColor)?.hex || "#8B4513",
                          }}
                        />
                        <p className="text-white text-center font-medium">{style.name}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {currentHairTab === "elements" && (
                <>
                  <h3 className="text-white font-bold text-xl mb-4">Hair Elements</h3>
                  <div className="grid grid-cols-3 gap-6">
                    {getFilteredHairItems().map((element: any) => (
                      <div
                        key={element.id}
                        onClick={() => handleHairElementToggle(element.id)}
                        className={`cursor-pointer rounded-lg p-4 transition-all ${
                          selectedHair.elements.includes(element.id)
                            ? "bg-[#00d9ff] bg-opacity-20 border-3 border-[#00d9ff]"
                            : "bg-[#0d1230] border-2 border-gray-700 hover:border-gray-500"
                        }`}
                        style={{
                          borderWidth: selectedHair.elements.includes(element.id) ? "3px" : "2px",
                        }}
                      >
                        <div className="w-full aspect-square rounded-lg mb-3 bg-gray-600" />
                        <p className="text-white text-center font-medium">{element.name}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Preview Panel */}
      <div className="w-[400px] bg-[#0d1230] border-l border-gray-800 flex flex-col">
        {/* Avatar Preview */}
        <div className="flex-1 bg-gradient-to-b from-[#1a1f3a] to-[#0d1230] flex items-center justify-center p-8">
          <AvatarPreview
            shirt={selectedShirt}
            pants={selectedPants}
            shoes={selectedShoes}
            body={selectedBody}
            hair={selectedHair}
          />
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex flex-col gap-3">
          {/* Placeholder icon buttons */}
          <div className="flex gap-3 justify-center mb-2">
            <button className="w-12 h-12 rounded-lg bg-[#1a1f3a] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-lg bg-[#1a1f3a] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>

          {/* Save & Exit Button */}
          <Button
            onClick={handleSaveAndExit}
            disabled={isSaving}
            className="w-full bg-[#00d9ff] hover:bg-cyan-600 text-white font-semibold py-4 text-lg rounded-lg transition-all neon-glow-cyan"
          >
            {isSaving ? "Saving..." : "Save & Exit"}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="bg-[#0d1230] border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-[#00d9ff] text-2xl">Unsaved Changes</DialogTitle>
            <DialogDescription className="text-gray-300 text-lg">
              You have unsaved changes. Leave without saving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              onClick={() => setShowExitModal(false)}
              className="bg-[#00d9ff] hover:bg-cyan-600 text-white font-semibold"
            >
              Keep Editing
            </Button>
            <Button
              onClick={handleLeave}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
