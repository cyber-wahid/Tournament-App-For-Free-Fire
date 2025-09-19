import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTournamentSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Trophy, Users, DollarSign, Calendar, ChevronDown } from "lucide-react";
import { CountdownTimer } from "@/components/ui/countdown-timer";

export default function TournamentManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<any>(null);

  const { data: tournaments, isLoading } = useQuery({
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

  const form = useForm({
    resolver: zodResolver(insertTournamentSchema),
    defaultValues: {
      title: "",
      description: "",
      gameType: "battle_royale",
      teamFormation: "solo",
      maxPlayers: 50,
      entryFee: "",
      prizePool: "",
      roomId: "",
      roomPassword: "",
      startTime: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/tournaments", data, token);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "টুর্নামেন্ট সফলভাবে তৈরি হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/tournaments/${id}`, data, token);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "টুর্নামেন্ট সফলভাবে আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      setEditingTournament(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/admin/tournaments/${id}/status`, { status }, token);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "টুর্নামেন্ট স্ট্যাটাস আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/tournaments/${id}`, undefined, token);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "টুর্নামেন্ট সফলভাবে মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Set maxPlayers based on game type and team formation
    const maxPlayers = getMaxPlayers(data.gameType, data.teamFormation);
    const updatedData = { ...data, maxPlayers };
    
    if (editingTournament) {
      updateMutation.mutate({ id: editingTournament.id, data: updatedData });
    } else {
      createMutation.mutate(updatedData);
    }
  };

  // Auto-update maxPlayers when game type or team formation changes
  useEffect(() => {
    const gameType = form.watch("gameType");
    const teamFormation = form.watch("teamFormation");
    const maxPlayers = getMaxPlayers(gameType, teamFormation);
    form.setValue("maxPlayers", maxPlayers);
  }, [form.watch("gameType"), form.watch("teamFormation")]);

  const handleEdit = (tournament: any) => {
    setEditingTournament(tournament);
    form.reset({
      title: tournament.title,
      description: tournament.description,
      gameType: tournament.gameType,
      teamFormation: tournament.teamFormation || "solo",
      maxPlayers: tournament.maxPlayers,
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      roomId: tournament.roomId || "",
      roomPassword: tournament.roomPassword || "",
      startTime: new Date(tournament.startTime).toISOString().slice(0, 16),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে আপনি এই টুর্নামেন্টটি মুছে ফেলতে চান?")) {
      deleteMutation.mutate(id);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-500 bg-opacity-20 text-blue-400";
      case "active": return "bg-green-500 bg-opacity-20 text-green-400";
      case "started": return "bg-orange-500 bg-opacity-20 text-orange-400";
      case "waiting": return "bg-yellow-500 bg-opacity-20 text-yellow-400";
      case "finished": return "bg-purple-500 bg-opacity-20 text-purple-400";
      case "completed": return "bg-gray-500 bg-opacity-20 text-gray-400";
      case "cancelled": return "bg-red-500 bg-opacity-20 text-red-400";
      default: return "bg-gray-500 bg-opacity-20 text-gray-400";
    }
  };

  const getMaxPlayers = (gameType: string, teamFormation: string) => {
    switch (gameType) {
      case "battle_royale":
        return 50; // 48-50 players for Battle Royale
      case "clash_squad":
        return 8; // 4v4 = 8 players
      case "lone_wolf":
        switch (teamFormation) {
          case "1v1": return 2;
          case "2v2": return 4;
          default: return 2;
        }
      default:
        return 50;
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-6">
          {/* Mobile Navigation Pills */}
          <div className="lg:hidden mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <div className="flex-shrink-0 bg-fire-yellow text-primary-dark px-4 py-2 rounded-lg font-medium text-sm">
                <Trophy className="w-4 h-4 mr-2 inline" />
                টুর্নামেন্ট
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">টুর্নামেন্ট ব্যবস্থাপনা</h2>
            <Dialog open={isCreateDialogOpen || !!editingTournament} onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false);
                setEditingTournament(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tournament
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary-dark border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-fire-yellow">
                    {editingTournament ? "Edit Tournament" : "Create New Tournament"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tournament Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter tournament title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gameType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Game Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select game type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="battle_royale">Battle Royale</SelectItem>
                                <SelectItem value="clash_squad">Clash Squad</SelectItem>
                                <SelectItem value="lone_wolf">Lone Wolf</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="teamFormation"
                        render={({ field }) => {
                          const gameType = form.watch("gameType");
                          const teamFormationOptions = (() => {
                            switch (gameType) {
                              case "battle_royale":
                                return [
                                  { value: "solo", label: "Solo" },
                                  { value: "duo", label: "Duo" },
                                  { value: "squad", label: "Squad" }
                                ];
                              case "clash_squad":
                                return [
                                  { value: "4v4", label: "4v4" }
                                ];
                              case "lone_wolf":
                                return [
                                  { value: "1v1", label: "1v1" },
                                  { value: "2v2", label: "2v2" }
                                ];
                              default:
                                return [];
                            }
                          })();

                          return (
                            <FormItem>
                              <FormLabel>Team Formation</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select team formation" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {teamFormationOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter tournament description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="maxPlayers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Players</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="50" 
                                value={getMaxPlayers(form.watch("gameType"), form.watch("teamFormation"))}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="entryFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entry Fee (৳)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter entry fee" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prizePool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prize Pool (৳)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter prize pool" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="roomId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room ID (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter room ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="roomPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Password (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter room password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {(createMutation.isPending || updateMutation.isPending) && <LoadingSpinner className="mr-2" size="sm" />}
                        {editingTournament ? "Update Tournament" : "Create Tournament"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          setEditingTournament(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tournaments List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" className="text-fire-yellow" />
            </div>
          ) : (
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
                          <th className="text-left py-4 px-6 font-semibold text-sm">Start Time</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {tournaments.map((tournament: any) => (
                          <tr key={tournament.id}>
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-medium">{tournament.title}</p>
                                <p className="text-sm text-secondary">
                                  {tournament.gameType === "battle_royale" && "Battle Royale"}
                                  {tournament.gameType === "clash_squad" && "Clash Squad"}
                                  {tournament.gameType === "lone_wolf" && "Lone Wolf"}
                                  {tournament.teamFormation && ` - ${tournament.teamFormation}`}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-secondary" />
                                <span className="text-sm">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-fire-yellow" />
                                <span className="text-fire-yellow font-medium">৳{tournament.entryFee}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-secondary" />
                                  <span className="text-sm">{formatDateTime(tournament.startTime)}</span>
                                </div>
                                <div className="text-xs text-secondary">
                                  <CountdownTimer startTime={tournament.startTime.toString()} />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Select
                                value={tournament.status}
                                onValueChange={(status) => updateStatusMutation.mutate({ id: tournament.id, status })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="upcoming">Upcoming</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="started">Started</SelectItem>
                                  <SelectItem value="waiting">Waiting</SelectItem>
                                  <SelectItem value="finished">Finished</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(tournament)}
                                  className="text-blue-400 hover:text-blue-300 border-blue-400"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(tournament.id)}
                                  disabled={deleteMutation.isPending}
                                  className="text-red-400 hover:text-red-300 border-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Trophy className="w-16 h-16 text-secondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Tournaments</h3>
                    <p className="text-secondary">Create your first tournament to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
