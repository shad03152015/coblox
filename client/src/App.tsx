import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CharacterCreate from "./pages/CharacterCreate";
import AvatarCustomize from "./pages/AvatarCustomize";
import Profile from "./pages/Profile";
import WorldView from "./pages/WorldView";
import CreateWorld from "./pages/CreateWorld";
import Settings from "./pages/Settings";
import MyWorlds from "./pages/MyWorlds";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/character-create"} component={CharacterCreate} />
      <Route path={"/avatar-customize"} component={AvatarCustomize} />
      <Route path={"/home"} component={Home} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/world/:worldId"} component={WorldView} />
      <Route path={"/create-world"} component={CreateWorld} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/my-worlds"} component={MyWorlds} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
