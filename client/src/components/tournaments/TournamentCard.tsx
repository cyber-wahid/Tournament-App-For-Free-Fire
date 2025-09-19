import { Tournament } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Clock, Users, Trophy, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CountdownTimer } from "@/components/ui/countdown-timer";

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const { user, token, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is already in this tournament
  const { data: userTournaments } = useQuery({
    queryKey: ["/api/user/tournaments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user/tournaments", undefined, token);
      return response as unknown as Tournament[];
    },
    enabled: !!user,
  });

  const isUserInTournament = Array.isArray(userTournaments) && userTournaments.some((t: Tournament) => t.id === tournament.id);

  const joinMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/tournaments/${tournament.id}/join`, undefined, token);
    },
    onSuccess: async () => {
      toast({
        title: "Success!",
        description: "Successfully joined the tournament",
      });
      
      // Refresh user data to update balance
      await refreshUser();
      
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/tournaments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleJoin = () => {
    if (!user) return;
    
    if (isUserInTournament) {
      toast({
        title: "Already Joined",
        description: "You are already registered for this tournament",
        variant: "destructive",
      });
      return;
    }
    
    const userBalance = parseFloat(user.balance);
    const entryFee = parseFloat(tournament.entryFee);
    
    if (userBalance < entryFee) {
      toast({
        title: "Insufficient Balance",
        description: "Please add money to your account to join this tournament",
        variant: "destructive",
      });
      return;
    }

    joinMutation.mutate();
  };

  const progressPercentage = (tournament.currentPlayers / tournament.maxPlayers) * 100;

  return (
    <div className="tournament-card rounded-xl p-4 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1">{tournament.title}</h4>
          <p className="text-secondary text-sm mb-1 whitespace-pre-line">{tournament.description}</p>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
              {tournament.gameType === "battle_royale" && "Battle Royale"}
              {tournament.gameType === "clash_squad" && "Clash Squad"}
              {tournament.gameType === "lone_wolf" && "Lone Wolf"}
            </span>
            {tournament.teamFormation && (
              <span className="bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                {tournament.teamFormation}
              </span>
            )}
          </div>
        </div>
        <div className="bg-fire-yellow text-primary-dark px-2 py-1 rounded-lg text-xs font-bold">
          ৳{tournament.entryFee}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-secondary" />
              <p className="text-xs text-secondary">Players</p>
            </div>
            <p className="text-sm font-semibold">{tournament.currentPlayers}/{tournament.maxPlayers}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3 text-fire-yellow" />
              <p className="text-xs text-secondary">Prize Pool</p>
            </div>
            <p className="text-sm font-semibold text-fire-yellow">৳{tournament.prizePool}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 justify-end">
            <Clock className="w-3 h-3 text-secondary" />
            <p className="text-xs text-secondary">Starts in</p>
          </div>
          <CountdownTimer startTime={tournament.startTime.toString()} className="text-sm font-semibold" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
          <div 
            className="bg-fire-yellow h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <Button 
          onClick={handleJoin}
          disabled={joinMutation.isPending || tournament.currentPlayers >= tournament.maxPlayers || isUserInTournament}
          className={`font-semibold text-sm ${
            isUserInTournament 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90 pulse-fire"
          }`}
        >
          {joinMutation.isPending ? "Joining..." : isUserInTournament ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Joined
            </>
          ) : "Join Now"}
        </Button>
      </div>
    </div>
  );
}
