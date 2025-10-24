import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

export default function CharacterCreate() {
  const [characterName, setCharacterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  const validateCharacterName = (name: string): string | null => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return "Character name is required";
    }

    if (trimmedName.length < 3) {
      return "Character name must be at least 3 characters";
    }

    if (trimmedName.length > 20) {
      return "Character name must be 20 characters or less";
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(trimmedName)) {
      return "Character name can only contain letters and numbers";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const validationError = validateCharacterName(characterName);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to create a character");
      setLocation("/");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "/api/character",
        {
          characterName: characterName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Character created successfully!");
        setLocation("/avatar-customize");
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Something went wrong, please try again");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] relative overflow-hidden flex items-center justify-center">
      {/* Animated background with cyberpunk city effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f3a] via-[#0a0e27] to-[#050810]" />

        {/* Neon city buildings silhouette */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          viewBox="0 0 1400 900"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Building 1 */}
          <rect x="100" y="300" width="120" height="600" fill="none" stroke="#00d9ff" strokeWidth="2" opacity="0.6" />
          <rect x="110" y="320" width="20" height="20" fill="#00d9ff" opacity="0.8" />
          <rect x="140" y="320" width="20" height="20" fill="#00d9ff" opacity="0.8" />
          <rect x="170" y="320" width="20" height="20" fill="#00d9ff" opacity="0.8" />
          <rect x="110" y="360" width="20" height="20" fill="#ff006e" opacity="0.6" />
          <rect x="140" y="360" width="20" height="20" fill="#00d9ff" opacity="0.8" />
          <rect x="170" y="360" width="20" height="20" fill="#00d9ff" opacity="0.8" />

          {/* Building 2 */}
          <rect x="280" y="200" width="140" height="700" fill="none" stroke="#ff006e" strokeWidth="2" opacity="0.6" />
          <rect x="295" y="230" width="25" height="25" fill="#ff006e" opacity="0.8" />
          <rect x="335" y="230" width="25" height="25" fill="#ff006e" opacity="0.8" />
          <rect x="375" y="230" width="25" height="25" fill="#ff006e" opacity="0.8" />

          {/* Building 3 */}
          <rect x="500" y="250" width="130" height="650" fill="none" stroke="#00d9ff" strokeWidth="2" opacity="0.6" />
          <rect x="515" y="280" width="22" height="22" fill="#00d9ff" opacity="0.8" />
          <rect x="550" y="280" width="22" height="22" fill="#00d9ff" opacity="0.8" />
          <rect x="585" y="280" width="22" height="22" fill="#00d9ff" opacity="0.8" />

          {/* Building 4 */}
          <rect x="700" y="150" width="150" height="750" fill="none" stroke="#b537f2" strokeWidth="2" opacity="0.6" />
          <rect x="720" y="180" width="25" height="25" fill="#b537f2" opacity="0.8" />
          <rect x="765" y="180" width="25" height="25" fill="#b537f2" opacity="0.8" />
          <rect x="810" y="180" width="25" height="25" fill="#b537f2" opacity="0.8" />

          {/* Building 5 */}
          <rect x="920" y="280" width="120" height="620" fill="none" stroke="#ff006e" strokeWidth="2" opacity="0.6" />
          <rect x="935" y="310" width="20" height="20" fill="#ff006e" opacity="0.8" />
          <rect x="965" y="310" width="20" height="20" fill="#ff006e" opacity="0.8" />
          <rect x="995" y="310" width="20" height="20" fill="#ff006e" opacity="0.8" />

          {/* Neon lines at top */}
          <line x1="50" y1="80" x2="1350" y2="80" stroke="#00d9ff" strokeWidth="2" opacity="0.4" />
          <line x1="50" y1="85" x2="1350" y2="85" stroke="#ff006e" strokeWidth="1" opacity="0.3" />
        </svg>

        {/* Neon glow effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
      </div>

      {/* Character Creation Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="cyberpunk-card p-[60px_40px]">
          {/* Title */}
          <div className="text-center mb-5">
            <h1 className="text-[48px] font-bold text-[#00d9ff] leading-tight">
              Create Your Champion
            </h1>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-[50px]">
            <p className="text-gray-600 text-[18px]">
              What name will define your legend?
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Character Name Input */}
            <div className="mb-[30px]">
              <Input
                type="text"
                placeholder="Enter your character's name"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-white border-[#00d9ff] border-2 rounded-lg px-4 py-4 text-gray-900 text-center placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00d9ff] hover:bg-cyan-600 text-white font-semibold py-[14px] px-10 rounded-lg transition-all duration-200 neon-glow-cyan"
            >
              {isSubmitting ? "Creating..." : (
                <span className="flex items-center justify-center gap-2">
                  Next
                  <span>→</span>
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Animated neon lines at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      <div className="absolute bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-30" />
    </div>
  );
}
