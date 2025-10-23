import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";

export default function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await axios.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);

        toast.success("Login successful!");

        // Redirect based on whether user has character
        if (response.data.user.characterName) {
          setLocation("/home");
        } else {
          setLocation("/character-create");
        }
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Something went wrong, please try again");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerEmail || !registerPassword || !registerConfirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsRegistering(true);

    try {
      const response = await axios.post("/api/auth/register", {
        email: registerEmail,
        password: registerPassword,
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);

        toast.success("Registration successful!");

        // New users don't have character, redirect to character creation
        setLocation("/character-create");
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Something went wrong, please try again");
      }
    } finally {
      setIsRegistering(false);
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="cyberpunk-card p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center neon-glow-cyan">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">BlockVerse</h1>
            <p className="text-gray-400 text-sm">Enter the Game Universe</p>
          </div>

          {/* Tabs for Login and Register */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent border-b-2 border-gray-200 rounded-none">
              <TabsTrigger
                value="login"
                className="text-cyan-500 data-[state=active]:text-cyan-500 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none border-b-2 border-transparent"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-gray-500 data-[state=active]:text-cyan-500 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none border-b-2 border-transparent"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username or Email
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your username or email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoggingIn}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoggingIn}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div className="text-right">
                  <a href="#" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium">
                    Forgot Password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-all duration-200 neon-glow-cyan"
                >
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={isRegistering}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={isRegistering}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    disabled={isRegistering}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-all duration-200 neon-glow-cyan"
                >
                  {isRegistering ? "Creating account..." : "Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>

      {/* Animated neon lines at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      <div className="absolute bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-30" />
    </div>
  );
}
