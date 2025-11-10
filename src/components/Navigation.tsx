import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Wallet, 
  Target, 
  MessageSquare, 
  ShieldAlert,
  BarChart3,
  User,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Repeat,
  Bell,
  MoreHorizontal
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import logoFullHorizontal from "@/assets/logo-full-horizontal.png";

const Navigation = () => {
  const location = useLocation();
  const { theme, systemTheme, setTheme } = useTheme();
  
  // Determine the current theme (respecting system preference)
  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? logoDark : logoLight;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/expenses", label: "Expenses", icon: Wallet },
    { path: "/budget", label: "Budget", icon: Target },
    { path: "/recurring", label: "Recurring", icon: Repeat },
    { path: "/reminders", label: "Reminders", icon: Bell },
    { path: "/chat", label: "AI Chat", icon: MessageSquare },
    { path: "/scam-alert", label: "Scam Alert", icon: ShieldAlert },
    { path: "/reports", label: "Reports", icon: BarChart3 },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const mobileNavItems = navItems.slice(0, 4); // First 4 items for mobile
  const moreMenuItems = [
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border h-screen sticky top-0">
        <div className="p-6 border-b border-border">
          <img 
            src={logoSrc}
            alt="MobiKudi" 
            className="h-12 w-12 transition-all duration-300" 
          />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-3"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                  "text-muted-foreground"
                )}
              >
                <MoreHorizontal className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 w-full cursor-pointer",
                        isActive && "text-primary font-medium"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
