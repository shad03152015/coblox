import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AvatarPreview } from "@/components/AvatarPreview";
import { toast } from "sonner";
import axios from "axios";

interface AvatarAppearance {
  shirt: { id: string; color: string };
  pants: { id: string; color: string };
  shoes: { id: string; color: string };
  body?: { type: string; skinTone: string };
  hair?: { baseStyle: string; elements: string[]; color: string };
  accessories?: {
    hat?: { id: string; color: string };
    glasses?: { id: string; color: string };
    jewelry?: { id: string; color: string };
    wings?: { id: string; color: string };
  };
}

interface UserProfile {
  email: string;
  characterName: string | null;
  avatarAppearance: AvatarAppearance | null;
  createdAt: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view your profile");
      setLocation("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/character/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setProfile(response.data.user);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          setTimeout(() => setLocation("/"), 2000);
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setLocation("/");
  };

  const handleCustomizeAvatar = () => {
    setLocation("/avatar-customize");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0e27] flex items-center justify-center">
        <p className="text-white text-xl">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-[#0a0e27] flex items-center justify-center">
        <p className="text-white text-xl">Failed to load profile</p>
      </div>
    );
  }

  // Default avatar appearance if not set
  const defaultAppearance: AvatarAppearance = {
    shirt: { id: "tshirt", color: "blue" },
    pants: { id: "jeans", color: "blue" },
    shoes: { id: "sneakers", color: "black" },
    body: { type: "average", skinTone: "tan" },
    hair: { baseStyle: "short-messy", elements: [], color: "black" },
  };

  const avatarAppearance = profile.avatarAppearance || defaultAppearance;

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f3a] via-[#0a0e27] to-[#050810]" />

      {/* Neon glow effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center neon-glow-cyan">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">BlockVerse</h1>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Logout
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold mb-4">
              Welcome,{" "}
              <span className="neon-text-cyan">{profile.characterName || "Champion"}</span>!
            </h2>
            <p className="text-gray-400 text-xl">Your champion profile</p>
          </div>

          {/* Profile Card */}
          <div className="bg-[#0d1230] border border-gray-800 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Preview */}
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-b from-[#1a1f3a] to-[#0d1230] rounded-lg p-6 border border-gray-700">
                  <AvatarPreview
                    shirt={avatarAppearance.shirt}
                    pants={avatarAppearance.pants}
                    shoes={avatarAppearance.shoes}
                    body={avatarAppearance.body}
                    hair={avatarAppearance.hair}
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-white font-bold text-2xl mb-4">
                    Character Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm">Character Name</label>
                      <p className="text-white text-lg font-semibold">
                        {profile.characterName || "No character name"}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Email</label>
                      <p className="text-white text-lg">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Member Since</label>
                      <p className="text-white text-lg">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Avatar Details */}
                {avatarAppearance && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">
                      Avatar Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-gray-400">Body Type</label>
                        <p className="text-white capitalize">
                          {avatarAppearance.body?.type || "Average"}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400">Skin Tone</label>
                        <p className="text-white capitalize">
                          {avatarAppearance.body?.skinTone || "Tan"}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400">Hair Style</label>
                        <p className="text-white capitalize">
                          {avatarAppearance.hair?.baseStyle.replace("-", " ") || "Short Messy"}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400">Hair Color</label>
                        <p className="text-white capitalize">
                          {avatarAppearance.hair?.color || "Black"}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400">Shirt</label>
                        <p className="text-white capitalize">
                          {avatarAppearance.shirt.id.replace("-", " ")} ({avatarAppearance.shirt.color})
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400">Pants</label>
                        <p className="text-white capitalize">
                          {avatarAppearance.pants.id.replace("-", " ")} ({avatarAppearance.pants.color})
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleCustomizeAvatar}
              className="bg-[#00d9ff] hover:bg-cyan-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 neon-glow-cyan"
            >
              Customize Avatar
            </Button>
            <Button
              onClick={() => setLocation("/home")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 py-3 px-8"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Animated neon lines at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      <div className="absolute bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-30" />
    </div>
  );
}
