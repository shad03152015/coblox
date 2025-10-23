import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [, setLocation] = useLocation();

  // TODO: Fetch actual character name from authenticated user when auth is implemented
  const characterName = "Champion";

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] relative overflow-hidden flex items-center justify-center">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f3a] via-[#0a0e27] to-[#050810]" />

      {/* Neon glow effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        {/* Welcome Message */}
        <h1 className="text-5xl font-bold mb-4">
          Welcome,{" "}
          <span className="neon-text-cyan">{characterName}</span>!
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-xl mb-8">
          Your champion profile
        </p>

        {/* Placeholder Text */}
        <p className="text-gray-500 text-lg mb-12">
          Profile page coming soon...
        </p>

        {/* Back to Home Button */}
        <Button
          onClick={() => setLocation("/home")}
          className="bg-[#00d9ff] hover:bg-cyan-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 neon-glow-cyan"
        >
          Back to Home
        </Button>
      </div>

      {/* Animated neon lines at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      <div className="absolute bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-30" />
    </div>
  );
}
