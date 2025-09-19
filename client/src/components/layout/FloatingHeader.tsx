import { useAuth } from "@/hooks/useAuth";
import { User, RefreshCw } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/authUtils";

export default function FloatingHeader() {
  const { user, refreshUser, token } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const response = await fetch("/api/user/profile", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: !!token,
  });

  // Use fresh profile data if available, otherwise fall back to auth context
  const currentUser = userProfile || user;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 floating-nav border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <div className="h-8 flex items-center justify-center">
            <img src="/ffclash.svg" alt="FF Clash" className="h-6 w-auto logo-svg" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-secondary">ব্যালেন্স</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-fire-yellow">৳{currentUser?.balance || '0.00'}</p>
              <button
                onClick={refreshUser}
                className="text-fire-yellow hover:text-orange-400 transition-colors"
                title="Refresh balance"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary-dark border-2 border-fire-yellow overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-fire-yellow to-orange-600 flex items-center justify-center">
              <User className="text-primary-dark text-xs" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
