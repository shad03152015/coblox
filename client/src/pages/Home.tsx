import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";
import {
  Search,
  Bell,
  ChevronDown,
  X,
  UserPlus,
  Mail,
  Users,
} from "lucide-react";

// World data interface
interface World {
  id: string;
  name: string;
  description: string;
  emoji: string;
  playerCount: string;
}

// Notification interface
interface Notification {
  _id: string;
  type: "friend_request" | "world_invite" | "system";
  title: string;
  message: string;
  read: boolean;
  data: any;
  createdAt: string;
}

// Friend interface
interface Friend {
  _id: string;
  characterName: string;
  currentWorld: string;
  avatarAppearance: any;
}

// User profile interface
interface UserProfile {
  characterName: string;
  avatarAppearance: any;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [friendsPlaying, setFriendsPlaying] = useState<Friend[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded world data based on the provided image
  const featuredWorld: World = {
    id: "neon-city",
    name: "Neon City",
    description:
      "The ultimate cyberpunk role-playing experience. Forge your destiny in a city that never sleeps.",
    emoji: "🌆",
    playerCount: "15.2k playing",
  };

  const popularWorlds: World[] = [
    {
      id: "mega-fun-obby",
      name: "Mega Fun Obby",
      description: "A fast-paced obstacle course!",
      emoji: "🏃",
      playerCount: "12.3k playing",
    },
    {
      id: "blockywood-rp",
      name: "Blockywood RP",
      description: "Live your dream life in the city.",
      emoji: "🏙️",
      playerCount: "8.1k playing",
    },
    {
      id: "dragons-peak",
      name: "Dragon's Peak",
      description: "Battle mythical beasts.",
      emoji: "🐉",
      playerCount: "5.7k playing",
    },
    {
      id: "theme-park-tycoon",
      name: "Theme Park Tycoon",
      description: "Build the park of your dreams.",
      emoji: "🎢",
      playerCount: "4.9k playing",
    },
  ];

  const exploreWorlds: World[] = [
    {
      id: "jungle-adventure",
      name: "Jungle Adventure",
      description: "Discover hidden temples.",
      emoji: "🌴",
      playerCount: "2.5k playing",
    },
    {
      id: "galaxy-racers",
      name: "Galaxy Racers",
      description: "Race across the cosmos!",
      emoji: "🚀",
      playerCount: "3.1k playing",
    },
    {
      id: "survival-island",
      name: "Survival Island",
      description: "Survive and build in the wild.",
      emoji: "🏝️",
      playerCount: "7.2k playing",
    },
    {
      id: "wizard-academy",
      name: "Wizard Academy",
      description: "Master the arcane arts.",
      emoji: "🧙",
      playerCount: "4.4k playing",
    },
  ];

  // Authentication and data fetching
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to access the dashboard");
      setLocation("/");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all data in parallel
        const [profileRes, notificationsRes, friendsRes] = await Promise.all([
          axios.get("/api/character/profile-summary", { headers }),
          axios.get("/api/notifications", { headers }).catch(() => ({ data: { notifications: [], unreadCount: 0 } })),
          axios.get("/api/friends/playing", { headers }).catch(() => ({ data: { friends: [] } })),
        ]);

        if (profileRes.data.success) {
          setUserProfile(profileRes.data.user);
        }

        if (notificationsRes.data.success) {
          setNotifications(notificationsRes.data.notifications);
          setUnreadCount(notificationsRes.data.unreadCount);
        }

        if (friendsRes.data.success) {
          setFriendsPlaying(friendsRes.data.friends);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          setTimeout(() => setLocation("/"), 2000);
        } else {
          console.error("Error fetching data:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setLocation]);

  // Filter worlds based on search term
  const filterWorlds = (worlds: World[]) => {
    if (!searchTerm.trim()) return worlds;
    const searchLower = searchTerm.toLowerCase();
    return worlds.filter(
      (world) =>
        world.name.toLowerCase().includes(searchLower) ||
        world.description.toLowerCase().includes(searchLower)
    );
  };

  const filteredPopular = filterWorlds(popularWorlds);
  const filteredExplore = filterWorlds(exploreWorlds);
  const filteredFriends = searchTerm.trim()
    ? friendsPlaying.filter((friend) => {
        const worldName = popularWorlds
          .concat(exploreWorlds)
          .find((w) => w.id === friend.currentWorld)?.name || "";
        return worldName.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : friendsPlaying;

  const hasResults =
    filteredPopular.length > 0 ||
    filteredExplore.length > 0 ||
    filteredFriends.length > 0;

  // Handle notification actions
  const handleMarkAsRead = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.patch(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const notification = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setLocation("/");
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="w-5 h-5" />;
      case "world_invite":
        return <Mail className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get notification icon background color
  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "friend_request":
        return "bg-blue-100";
      case "world_invite":
        return "bg-green-100";
      default:
        return "bg-yellow-100";
    }
  };

  // World Card Component
  const WorldCard = ({
    world,
    isFriendCard,
    friend,
  }: {
    world: World;
    isFriendCard?: boolean;
    friend?: Friend;
  }) => (
    <div
      onClick={() => setLocation(`/world/${world.id}`)}
      className="bg-white bg-opacity-95 rounded-xl border-2 border-gray-300 overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-36 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-b-2 border-gray-200">
        <div className="text-5xl">{world.emoji}</div>
        {/* Friend overlay for friend cards */}
        {isFriendCard && friend && (
          <div className="absolute bottom-3 left-3 bg-[#0a0e27] bg-opacity-90 rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {friend.characterName[0]}
            </div>
            <span className="text-white text-sm font-medium">
              {friend.characterName}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-[#0a0e27] font-bold text-base mb-1.5">
          {world.name}
        </h3>
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {world.description}
        </p>
        <div className="flex items-center gap-1.5 text-gray-600 text-xs mb-3">
          <Users className="w-3.5 h-3.5" />
          <span>{world.playerCount}</span>
        </div>
        <Button
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 rounded-md py-2 text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            setLocation(`/world/${world.id}`);
          }}
        >
          {isFriendCard ? "Join Friend" : "Join World"}
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0e27] flex items-center justify-center">
        <p className="text-white text-xl">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0e27]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0e27] border-b-2 border-gray-800">
        <div className="max-w-[1280px] mx-auto px-8 h-[72px] flex items-center justify-between gap-6">
          {/* Logo */}
          <div
            onClick={() => setLocation("/home")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="text-cyan-400 text-2xl">◆</div>
            <h1 className="text-white font-bold text-xl">BlockVerse</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-[400px] relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for worlds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-11 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Create Button */}
          <Button
            onClick={() => setLocation("/create-world")}
            className="bg-[#00d9ff] hover:bg-cyan-600 text-[#0a0e27] font-semibold px-6 py-2.5 rounded-lg"
          >
            Create
          </Button>

          {/* Notification Bell */}
          <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <PopoverTrigger asChild>
              <button className="relative w-10 h-10 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors">
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 max-h-[480px] overflow-hidden">
              {/* Notification Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-lg text-[#0a0e27]">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <button className="text-sm text-[#00d9ff] hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-900 font-medium mb-1">
                      No notifications
                    </p>
                    <p className="text-gray-500 text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-start gap-3 ${
                        !notification.read ? "bg-blue-50" : "bg-white"
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification._id);
                        }
                      }}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0a0e27]">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {userProfile?.characterName?.[0] || "P"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0e27]" />
                </div>
                <span className="text-white font-medium hidden md:block">
                  {userProfile?.characterName || "PixelPioneer"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setLocation("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/my-worlds")}>
                My Worlds
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto">
        {/* Hero Section */}
        <div className="px-8 pt-8 pb-6">
          <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 border-2 border-purple-500 rounded-2xl overflow-hidden">
            <div className="relative z-10 px-16 py-20">
              <h2 className="text-5xl font-bold text-white mb-4">
                Explore Neon City!
              </h2>
              <p className="text-gray-200 text-lg mb-6 max-w-[500px]">
                {featuredWorld.description}
              </p>
              <Button
                onClick={() => setLocation("/world/neon-city")}
                className="bg-[#00d9ff] hover:bg-cyan-600 text-[#0a0e27] font-semibold px-8 py-3 rounded-lg text-base"
              >
                Join Now
              </Button>
            </div>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 text-8xl opacity-40">
              🌆
            </div>
          </div>
        </div>

        {/* Popular Now Section */}
        {filteredPopular.length > 0 && (
          <div className="px-8 pb-12">
            <h2 className="text-white text-2xl font-bold mb-5">Popular Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredPopular.map((world) => (
                <WorldCard key={world.id} world={world} />
              ))}
            </div>
          </div>
        )}

        {/* Explore Worlds Section */}
        {filteredExplore.length > 0 && (
          <div className="px-8 pb-12">
            <h2 className="text-white text-2xl font-bold mb-5">
              Explore Worlds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredExplore.map((world) => (
                <WorldCard key={world.id} world={world} />
              ))}
            </div>
          </div>
        )}

        {/* Friends Are Playing Section */}
        {filteredFriends.length > 0 && (
          <div className="px-8 pb-12">
            <h2 className="text-white text-2xl font-bold mb-5">
              Friends Are Playing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredFriends.map((friend) => {
                const world =
                  popularWorlds
                    .concat(exploreWorlds)
                    .find((w) => w.id === friend.currentWorld) ||
                  featuredWorld;
                return (
                  <WorldCard
                    key={friend._id}
                    world={world}
                    isFriendCard
                    friend={friend}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Empty Friends State */}
        {!searchTerm && friendsPlaying.length === 0 && (
          <div className="px-8 pb-12">
            <h2 className="text-white text-2xl font-bold mb-5">
              Friends Are Playing
            </h2>
            <div className="bg-gray-800 rounded-xl py-12 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300 text-lg mb-1">
                None of your friends are playing right now
              </p>
              <p className="text-gray-500">Invite friends to join BlockVerse!</p>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchTerm && !hasResults && (
          <div className="px-8 pb-12">
            <div className="bg-gray-800 rounded-xl py-16 text-center">
              <p className="text-gray-400 text-lg">
                No worlds found matching "{searchTerm}"
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
