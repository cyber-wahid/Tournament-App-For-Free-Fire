import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import FloatingHeader from "@/components/layout/FloatingHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, Filter } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const { data: tournaments, isLoading } = useQuery<any[]>({
    queryKey: ["/api/tournaments"],
  });

  const filteredTournaments = useMemo(() => {
    if (!tournaments) return [];
    
    if (selectedFilter === "all") return tournaments;
    
    return tournaments.filter((tournament: any) => {
      switch (selectedFilter) {
        case "battle_royale":
          return tournament.gameType === "battle_royale";
        case "clash_squad":
          return tournament.gameType === "clash_squad";
        case "lone_wolf":
          return tournament.gameType === "lone_wolf";
        default:
          return true;
      }
    });
  }, [tournaments, selectedFilter]);

  return (
    <div className="min-h-screen bg-primary-dark">
      <FloatingHeader />
      
      <main className="pt-20 pb-24 px-4">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="fire-gradient rounded-2xl p-6 text-primary-dark relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">জয়ের জন্য প্রস্তুত?</h2>
              <p className="text-sm opacity-90 mb-4">টুর্নামেন্টে যোগ দিন এবং অসাধারণ পুরস্কারের জন্য প্রতিযোগিতা করুন!</p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-xs opacity-80">সক্রিয় টুর্নামেন্ট</p>
                  <p className="text-lg font-bold">{tournaments?.length || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs opacity-80">মোট খেলোয়াড়</p>
                  <p className="text-lg font-bold">
                    {tournaments?.reduce((sum: number, t: any) => sum + t.currentPlayers, 0) || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 opacity-20">
              <i className="fas fa-fire text-6xl"></i>
            </div>
          </div>
        </section>

        {/* Active Tournaments */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">সক্রিয় টুর্নামেন্ট</h3>
            <button className="text-fire-yellow text-sm font-medium">
              সব দেখুন <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-secondary" />
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
              className={selectedFilter === "all" ? "bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90" : "border-gray-600"}
            >
              সব
            </Button>
            <Button
              variant={selectedFilter === "battle_royale" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("battle_royale")}
              className={selectedFilter === "battle_royale" ? "bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90" : "border-gray-600"}
            >
              Battle Royale
            </Button>
            <Button
              variant={selectedFilter === "clash_squad" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("clash_squad")}
              className={selectedFilter === "clash_squad" ? "bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90" : "border-gray-600"}
            >
              Clash Squad
            </Button>
            <Button
              variant={selectedFilter === "lone_wolf" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("lone_wolf")}
              className={selectedFilter === "lone_wolf" ? "bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90" : "border-gray-600"}
            >
              Lone Wolf
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" className="text-fire-yellow" />
            </div>
          ) : (filteredTournaments && filteredTournaments.length > 0) ? (
            <div className="space-y-4">
              {filteredTournaments.map((tournament: any) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-secondary">
                {selectedFilter === "all" 
                  ? "কোন সক্রিয় টুর্নামেন্ট নেই" 
                  : `কোন ${selectedFilter === "battle_royale" ? "Battle Royale" : selectedFilter === "clash_squad" ? "Clash Squad" : "Lone Wolf"} টুর্নামেন্ট নেই`
                }
              </p>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-4">দ্রুত কাজ</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/add-money")}
              className="h-auto p-4 flex-col space-y-2 border-gray-600 hover:border-fire-yellow hover:bg-fire-yellow bg-secondary-dark group"
            >
              <PlusCircle className="text-fire-yellow group-hover:text-fire-black text-2xl transition-colors" />
              <div className="text-center">
                <p className="font-semibold text-sm group-hover:text-fire-black transition-colors">টাকা যোগ করুন</p>
                <p className="text-xs text-secondary group-hover:text-fire-black/70 transition-colors">ওয়ালেটে টাকা যোগ করুন</p>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/withdraw")}
              className="h-auto p-4 flex-col space-y-2 border-gray-600 hover:border-fire-yellow hover:bg-fire-yellow bg-secondary-dark group"
            >
              <DollarSign className="text-fire-yellow group-hover:text-fire-black text-2xl transition-colors" />
              <div className="text-center">
                <p className="font-semibold text-sm group-hover:text-fire-black transition-colors">উত্তোলন</p>
                <p className="text-xs text-secondary group-hover:text-fire-black/70 transition-colors">আয় উত্তোলন করুন</p>
              </div>
            </Button>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
