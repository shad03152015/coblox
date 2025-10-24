import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MyWorlds() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view your worlds");
      setLocation("/");
    }
  }, [setLocation]);

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
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">BlockVerse</h1>
        </div>
        <Button
          onClick={() => setLocation("/home")}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Back to Home
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-5xl font-bold mb-4 text-white">
            <span className="neon-text-cyan">My Worlds</span>
          </h2>
          <p className="text-gray-400 text-xl mb-8">
            My worlds coming soon
          </p>
          <div className="bg-[#0d1230] border border-gray-800 rounded-xl p-12 mb-8">
            <div className="text-6xl mb-6">🗺️</div>
            <p className="text-gray-300 text-lg mb-2">
              Manage all your created worlds in one place.
            </p>
            <p className="text-gray-500">
              View stats, edit settings, and publish updates for your worlds. Coming soon!
            </p>
          </div>
          <Button
            onClick={() => setLocation("/home")}
            className="bg-[#00d9ff] hover:bg-cyan-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 neon-glow-cyan"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>

      {/* Animated neon lines at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      <div className="absolute bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-30" />
    </div>
  );
}
