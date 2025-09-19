import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import FloatingHeader from "@/components/layout/FloatingHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { getAuthHeaders } from "@/lib/authUtils";
import { CountdownTimer } from "@/components/ui/countdown-timer";




export default function MyTournaments() {
  const { token } = useAuth();

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["/api/user/tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/user/tournaments", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tournaments");
      }
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-500";
      case "active": return "bg-green-500";
      case "completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <FloatingHeader />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-fire-yellow mb-6">My Tournaments</h1>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" className="text-fire-yellow" />
            </div>
          ) : tournaments?.length > 0 ? (
            <div className="space-y-4">
              {tournaments.map((tournament: any) => (
                <Card key={tournament.id} className="bg-secondary-dark border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{tournament.title}</h3>
                        <p className="text-sm text-secondary whitespace-pre-line">{tournament.description}</p>
                      </div>
                      <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                        {tournament.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="text-sm">
                          {tournament.currentPlayers}/{tournament.maxPlayers} Players
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-fire-yellow" />
                        <span className="text-sm text-fire-yellow">৳{tournament.entryFee}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-fire-yellow" />
                        <span className="text-sm">৳{tournament.prizePool}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        <div className="flex flex-col">
                          <span className="text-xs text-secondary">Starts in:</span>
                          <CountdownTimer startTime={tournament.startTime.toString()} />
                        </div>
                      </div>
                    </div>

                    {tournament.roomId && (
                      <div className="bg-primary-dark rounded-lg p-3 mt-4">
                        <p className="text-sm font-medium mb-1">Room Details:</p>
                        <p className="text-xs text-secondary">ID: {tournament.roomId}</p>
                        {tournament.roomPassword && (
                          <p className="text-xs text-secondary">Password: {tournament.roomPassword}</p>
                        )}
                      </div>
                    )}

                    {/* Warning Section */}
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-3 mt-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-400 mb-1">সতর্কবাণী:</p>
                          <p className="text-xs text-red-300 leading-relaxed">
                            হ্যাক ও চিট ব্যবহার করলে অ্যাপ থেকে ব্যান করার হবে এবং তার টাকা অ্যাকাউন্ট এ থাকলে তা বাজেয়াপ্ত করা হবে।
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tournaments Yet</h3>
              <p className="text-secondary">
                You haven't joined any tournaments. Start playing to see your tournaments here!
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
