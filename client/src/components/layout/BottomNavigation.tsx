import { useLocation } from "wouter";
import { Trophy, Gamepad, User, Wallet, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  const [progressWidth, setProgressWidth] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const navItems = [
    { path: "/", icon: Trophy, label: "টুর্নামেন্ট" },
    { path: "/my-tournaments", icon: Gamepad, label: "আমার টুর্নামেন্ট" },
    { path: "/profile", icon: User, label: "প্রোফাইল" },
    { path: "/add-money", icon: Wallet, label: "টাকা যোগ করুন" },
    { path: "/withdraw", icon: ArrowUp, label: "উত্তোলন" },
  ];

  // Calculate progress bar position based on current location
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === location);
    if (currentIndex !== -1) {
      // Start loading animation like browser reload
      setIsAnimating(true);
      setProgressWidth(0);
      
      // Simulate browser loading progress
      setTimeout(() => setProgressWidth(20), 100);
      setTimeout(() => setProgressWidth(40), 200);
      setTimeout(() => setProgressWidth(60), 300);
      setTimeout(() => setProgressWidth(80), 400);
      setTimeout(() => setProgressWidth(100), 500);
      
      // Hide progress bar after completion
      setTimeout(() => {
        setProgressWidth(0);
        setIsAnimating(false);
      }, 600);
    }
  }, [location, navItems.length]);

  return (
    <div className="fixed bottom-0 left-0 right-0">
      {/* Progress Bar */}
      <div className="w-full h-0.5 bg-gray-800">
        <div 
          className={`h-full bg-[#FF8200] transition-all duration-100 ease-linear`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
      
      {/* Navigation */}
      <nav className="floating-nav border-t border-gray-700 bg-secondary-dark">
        <div className="flex items-center justify-around py-3">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center space-y-1 transition-colors duration-200 ${
                location === path ? "text-fire-yellow" : "text-secondary hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
