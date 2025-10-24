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

type ClothingCategory = "shirt" | "pants" | "shoes";
type TabType = "shirts" | "pants" | "shoes";

interface ClothingSelection {
  id: string;
  color: string;
}

export default function AvatarCustomize() {
  const [, setLocation] = useLocation();

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

  // UI state
  const [currentTab, setCurrentTab] = useState<TabType>("shirts");
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
          setSelectedShirt(appearance.shirt);
          setSelectedPants(appearance.pants);
          setSelectedShoes(appearance.shoes);
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

  // Get filtered items based on current tab, search, and color
  const getFilteredItems = () => {
    let categoryItems = clothingItems.filter((item) => {
      if (currentTab === "shirts") return item.category === "shirt";
      if (currentTab === "pants") return item.category === "pants";
      if (currentTab === "shoes") return item.category === "shoes";
      return false;
    });

    // Apply search filter
    if (searchQuery.trim()) {
      categoryItems = categoryItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return categoryItems;
  };

  const filteredItems = getFilteredItems();

  // Handle tab switching
  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setSearchQuery(""); // Reset search when switching tabs
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
  };

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    const selection = { id: itemId, color: currentColor };

    if (currentTab === "shirts") {
      setSelectedShirt(selection);
    } else if (currentTab === "pants") {
      setSelectedPants(selection);
    } else if (currentTab === "shoes") {
      setSelectedShoes(selection);
    }

    setHasUnsavedChanges(true);
  };

  // Check if an item is currently selected
  const isItemSelected = (itemId: string): boolean => {
    if (currentTab === "shirts") return selectedShirt.id === itemId && selectedShirt.color === currentColor;
    if (currentTab === "pants") return selectedPants.id === itemId && selectedPants.color === currentColor;
    if (currentTab === "shoes") return selectedShoes.id === itemId && selectedShoes.color === currentColor;
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

  // Get search placeholder based on current tab
  const getSearchPlaceholder = () => {
    if (currentTab === "shirts") return "Search for shirts...";
    if (currentTab === "pants") return "Search for pants...";
    if (currentTab === "shoes") return "Search for shoes...";
    return "Search...";
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
        {/* Clothing button (active) */}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-14 h-14 rounded-lg bg-[#00d9ff] bg-opacity-20 border-2 border-[#00d9ff] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#00d9ff]"
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
          <span className="text-[#00d9ff] text-xs font-medium">Clothing</span>
        </div>

        {/* Body button (disabled) */}
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="text-gray-500 text-xs font-medium">Body</span>
        </div>

        {/* Hair button (disabled) */}
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
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-gray-500 text-xs font-medium">Hair</span>
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
        <h1 className="text-5xl font-bold text-[#00d9ff] mb-6">Avatar Customization</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => handleTabChange("shirts")}
            className={`px-6 py-3 font-semibold transition-all ${
              currentTab === "shirts"
                ? "text-[#00d9ff] border-b-3 border-[#00d9ff]"
                : "text-gray-400 hover:text-gray-200"
            }`}
            style={{
              borderBottomWidth: currentTab === "shirts" ? "3px" : "0",
              borderBottomColor: currentTab === "shirts" ? "#00d9ff" : "transparent",
            }}
          >
            Shirts
          </button>
          <button
            onClick={() => handleTabChange("pants")}
            className={`px-6 py-3 font-semibold transition-all ${
              currentTab === "pants"
                ? "text-[#00d9ff] border-b-3 border-[#00d9ff]"
                : "text-gray-400 hover:text-gray-200"
            }`}
            style={{
              borderBottomWidth: currentTab === "pants" ? "3px" : "0",
              borderBottomColor: currentTab === "pants" ? "#00d9ff" : "transparent",
            }}
          >
            Pants
          </button>
          <button
            onClick={() => handleTabChange("shoes")}
            className={`px-6 py-3 font-semibold transition-all ${
              currentTab === "shoes"
                ? "text-[#00d9ff] border-b-3 border-[#00d9ff]"
                : "text-gray-400 hover:text-gray-200"
            }`}
            style={{
              borderBottomWidth: currentTab === "shoes" ? "3px" : "0",
              borderBottomColor: currentTab === "shoes" ? "#00d9ff" : "transparent",
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
          {filteredItems.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-400 text-lg">No items found. Try a different search.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemSelect(item.id)}
                className={`cursor-pointer rounded-lg p-4 transition-all ${
                  isItemSelected(item.id)
                    ? "bg-[#00d9ff] bg-opacity-20 border-3 border-[#00d9ff]"
                    : "bg-[#0d1230] border-2 border-gray-700 hover:border-gray-500"
                }`}
                style={{
                  borderWidth: isItemSelected(item.id) ? "3px" : "2px",
                }}
              >
                <div
                  className="w-full aspect-square rounded-lg mb-3"
                  style={{ backgroundColor: availableColors.find(c => c.name === currentColor)?.hex || "#339af0" }}
                />
                <p className="text-white text-center font-medium">{item.name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="w-[400px] bg-[#0d1230] border-l border-gray-800 flex flex-col">
        {/* Avatar Preview */}
        <div className="flex-1 bg-gradient-to-b from-[#1a1f3a] to-[#0d1230] flex items-center justify-center p-8">
          <AvatarPreview shirt={selectedShirt} pants={selectedPants} shoes={selectedShoes} />
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex flex-col gap-3">
          {/* Placeholder icon buttons */}
          <div className="flex gap-3 justify-center mb-2">
            <button className="w-12 h-12 rounded-lg bg-[#1a1f3a] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-lg bg-[#1a1f3a] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
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
