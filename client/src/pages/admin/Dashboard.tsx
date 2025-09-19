import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAuthHeaders } from "@/lib/authUtils";
import { 
  Users, 
  Trophy, 
  Bell, 
  TrendingUp, 
  UserPlus, 
  DollarSign, 
  AlertTriangle,
  ChartLine 
} from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard/stats", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
  });

  const { data: tournaments } = useQuery({
    queryKey: ["/api/admin/tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/tournaments", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tournaments");
      }
      return response.json();
    },
  });

  const { data: balanceRequests } = useQuery({
    queryKey: ["/api/admin/balance-requests"],
    queryFn: async () => {
      const response = await fetch("/api/admin/balance-requests", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch balance requests");
      }
      return response.json();
    },
  });

  const getRecentActivity = () => {
    const activities: any[] = [];
    
    // Add recent tournaments
    if (tournaments) {
      tournaments.slice(0, 2).forEach((tournament: any) => {
        activities.push({
          type: "tournament",
          title: "Tournament created",
          description: `${tournament.title} was created`,
          time: new Date(tournament.createdAt).toLocaleString(),
          icon: Trophy,
          color: "text-fire-yellow",
        });
      });
    }

    // Add recent balance requests
    if (balanceRequests) {
      balanceRequests.slice(0, 3).forEach((request: any) => {
        activities.push({
          type: "request",
          title: `Balance request ${request.status}`,
          description: `৳${request.amount} - ${request.paymentMethod}`,
          time: new Date(request.createdAt).toLocaleString(),
          icon: request.status === "pending" ? AlertTriangle : DollarSign,
          color: request.status === "pending" ? "text-red-400" : "text-green-400",
        });
      });
    }

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-4 lg:p-6 lg:ml-0">
          {/* Mobile Navigation Pills */}
          <div className="lg:hidden mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <div className="flex-shrink-0 bg-fire-yellow text-primary-dark px-4 py-2 rounded-lg font-medium text-sm">
                <ChartLine className="w-4 h-4 mr-2 inline" />
                ড্যাশবোর্ড
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6">ড্যাশবোর্ড ওভারভিউ</h2>
            
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" className="text-fire-yellow" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-secondary-dark border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-secondary text-sm">মোট ব্যবহারকারী</p>
                        <p className="text-2xl font-bold text-fire-yellow">{stats?.totalUsers || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-fire-yellow bg-opacity-20 rounded-lg flex items-center justify-center">
                        <Users className="text-fire-yellow text-xl" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className="text-green-400 text-sm">সক্রিয়</span>
                      <span className="text-secondary text-sm ml-2">নিবন্ধিত ব্যবহারকারী</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary-dark border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-secondary text-sm">সক্রিয় টুর্নামেন্ট</p>
                        <p className="text-2xl font-bold text-fire-yellow">{stats?.activeTournaments || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-fire-yellow bg-opacity-20 rounded-lg flex items-center justify-center">
                        <Trophy className="text-fire-yellow text-xl" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className="text-green-400 text-sm">চলমান</span>
                      <span className="text-secondary text-sm ml-2">টুর্নামেন্ট</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary-dark border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-secondary text-sm">অপেক্ষমান অনুরোধ</p>
                        <p className="text-2xl font-bold text-red-400">{stats?.pendingRequests || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                        <Bell className="text-red-400 text-xl" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className="text-red-400 text-sm">মনোযোগ প্রয়োজন</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary-dark border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-secondary text-sm">মোট আয়</p>
                        <p className="text-2xl font-bold text-fire-yellow">৳{stats?.totalRevenue || "0"}</p>
                      </div>
                      <div className="w-12 h-12 bg-fire-yellow bg-opacity-20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="text-fire-yellow text-xl" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className="text-green-400 text-sm">মোট আয়</span>
                      <span className="text-secondary text-sm ml-2">টুর্নামেন্ট থেকে</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Activity</h3>
            </div>

            <Card className="bg-secondary-dark border-gray-700">
              <CardContent className="p-0">
                {getRecentActivity().length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {getRecentActivity().map((activity, index) => (
                      <div key={index} className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${activity.color.includes('fire-yellow') ? 'bg-fire-yellow bg-opacity-20' : activity.color.includes('red') ? 'bg-red-500 bg-opacity-20' : 'bg-green-500 bg-opacity-20'} rounded-lg flex items-center justify-center`}>
                            <activity.icon className={`${activity.color} w-5 h-5`} />
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-secondary">{activity.description}</p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-secondary">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Quick Tournament Overview */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Tournaments</h3>
            </div>

            <Card className="bg-secondary-dark border-gray-700">
              <CardContent className="p-0">
                {tournaments && tournaments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Tournament</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Players</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Entry Fee</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {tournaments.slice(0, 5).map((tournament: any) => (
                          <tr key={tournament.id}>
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-medium">{tournament.title}</p>
                                <p className="text-sm text-secondary">{tournament.gameType}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-fire-yellow font-medium">৳{tournament.entryFee}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                tournament.status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                                tournament.status === 'upcoming' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                                'bg-gray-500 bg-opacity-20 text-gray-400'
                              }`}>
                                {tournament.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-secondary">No tournaments created yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
