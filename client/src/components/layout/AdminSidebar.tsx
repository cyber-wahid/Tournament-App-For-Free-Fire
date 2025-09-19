import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, Trophy, Users, Bell, Wallet, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getAuthHeaders } from "@/lib/authUtils";

export default function AdminSidebar() {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch pending requests count with proper error handling
  const { data: pendingCount } = useQuery({
    queryKey: ["/api/admin/pending-requests-count"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/pending-requests-count", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        // Return 0 if API fails to avoid false notifications
        return { count: 0 };
      }
      return response.json();
    },
    refetchInterval: 30000,
    retry: false, // Don't retry to avoid showing false notifications
  });

  const navItems = [
    { path: "/admin/superuserz", icon: ChartLine, label: "ড্যাশবোর্ড" },
    { path: "/admin/superuserz/tournaments", icon: Trophy, label: "টুর্নামেন্ট" },
    { path: "/admin/superuserz/users", icon: Users, label: "ব্যবহারকারী" },
    { path: "/admin/superuserz/requests", icon: Bell, label: "অনুরোধ" },
    { path: "/admin/superuserz/wallets", icon: Wallet, label: "ওয়ালেট সেটিংস" },
    { path: "/admin/superuserz/settings", icon: Settings, label: "সিস্টেম সেটিংস" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const NavItems = () => (
    <ul className="space-y-2">
      {navItems.map(({ path, icon: Icon, label }) => (
        <li key={path}>
          <button
            onClick={() => handleNavigation(path)}
            className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              location === path
                ? "bg-fire-yellow text-primary-dark"
                : "text-secondary hover:bg-gray-700 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {path === "/admin/superuserz/requests" && location !== path && pendingCount && pendingCount.count > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingCount.count}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-secondary-dark border-r border-gray-700 min-h-screen">
        <nav className="p-6">
          <NavItems />
        </nav>
      </aside>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-secondary-dark border border-gray-700"
            >
              <Menu className="h-5 w-5 text-fire-yellow" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-secondary-dark border-r border-gray-700 p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-8 flex items-center justify-center">
                    <img src="/ffclash.svg" alt="FF Clash" className="h-6 w-auto logo-svg" />
                  </div>
                  <h1 className="text-lg font-bold text-fire-yellow">Admin</h1>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-secondary hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <NavItems />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
