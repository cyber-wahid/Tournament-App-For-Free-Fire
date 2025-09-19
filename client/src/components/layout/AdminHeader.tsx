import { useAuth } from "@/hooks/useAuth";
import { Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminHeader() {
  const { admin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-secondary-dark border-b border-gray-700">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 flex items-center justify-center">
            <img src="/ffclash.svg" alt="FF Clash" className="h-6 w-auto logo-svg" />
          </div>
          <h1 className="text-lg lg:text-xl font-bold text-fire-yellow">Admin</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Button className="bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90">
              <Plus className="w-4 h-4 mr-2" />
              টুর্নামেন্ট তৈরি করুন
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:block text-sm text-secondary">{admin?.username}</span>
            <button onClick={logout} className="text-red-400 hover:text-red-300">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="md:hidden px-4 lg:px-6 pb-4">
        <Button className="w-full bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90">
          <Plus className="w-4 h-4 mr-2" />
          টুর্নামেন্ট তৈরি করুন
        </Button>
      </div>
    </header>
  );
}
