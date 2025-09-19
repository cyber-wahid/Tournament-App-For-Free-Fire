import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bell, 
  DollarSign, 
  ArrowUp, 
  Check, 
  X, 
  Clock, 
  CreditCard,
  Calendar
} from "lucide-react";

export default function RequestManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: balanceRequests, isLoading: balanceLoading } = useQuery({
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

  const { data: withdrawRequests, isLoading: withdrawLoading } = useQuery({
    queryKey: ["/api/admin/withdraw-requests"],
    queryFn: async () => {
      const response = await fetch("/api/admin/withdraw-requests", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch withdraw requests");
      }
      return response.json();
    },
  });

  const updateBalanceRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/admin/balance-requests/${id}/status`, { status }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Balance request updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/balance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWithdrawRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/admin/withdraw-requests/${id}/status`, { status }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Withdraw request updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdraw-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBalanceRequestUpdate = (id: string, status: string) => {
    updateBalanceRequestMutation.mutate({ id, status });
  };

  const handleWithdrawRequestUpdate = (id: string, status: string) => {
    updateWithdrawRequestMutation.mutate({ id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500 bg-opacity-20 text-yellow-400";
      case "approved": return "bg-green-500 bg-opacity-20 text-green-400";
      case "rejected": return "bg-red-500 bg-opacity-20 text-red-400";
      case "completed": return "bg-blue-500 bg-opacity-20 text-blue-400";
      default: return "bg-gray-500 bg-opacity-20 text-gray-400";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "bkash": return "📱";
      case "nagad": return "💳";
      case "rocket": return "🚀";
      default: return "💰";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingBalanceCount = balanceRequests?.filter((r: any) => r.status === "pending").length || 0;
  const pendingWithdrawCount = withdrawRequests?.filter((r: any) => r.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-primary-dark">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-6">
          {/* Mobile Navigation Pills */}
          <div className="lg:hidden mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <div className="flex-shrink-0 bg-fire-yellow text-primary-dark px-4 py-2 rounded-lg font-medium text-sm relative">
                <Bell className="w-4 h-4 mr-2 inline" />
                Requests
                {(pendingBalanceCount + pendingWithdrawCount) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingBalanceCount + pendingWithdrawCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Request Management</h2>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-secondary">Pending Balance</p>
                <p className="text-lg font-bold text-yellow-400">{pendingBalanceCount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-secondary">Pending Withdraw</p>
                <p className="text-lg font-bold text-red-400">{pendingWithdrawCount}</p>
              </div>
            </div>
          </div>

          {/* Requests Tabs */}
          <Tabs defaultValue="balance" className="space-y-6">
            <TabsList className="bg-secondary-dark border-gray-700">
              <TabsTrigger value="balance" className="data-[state=active]:bg-fire-yellow data-[state=active]:text-primary-dark">
                <DollarSign className="w-4 h-4 mr-2" />
                Balance Requests
                {pendingBalanceCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">{pendingBalanceCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="data-[state=active]:bg-fire-yellow data-[state=active]:text-primary-dark">
                <ArrowUp className="w-4 h-4 mr-2" />
                Withdraw Requests
                {pendingWithdrawCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">{pendingWithdrawCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Balance Requests */}
            <TabsContent value="balance">
              <Card className="bg-secondary-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-fire-yellow">Balance Add Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {balanceLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" className="text-fire-yellow" />
                    </div>
                  ) : balanceRequests && balanceRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-sm">User</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Amount</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Payment Details</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Date</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {balanceRequests.map((request: any) => (
                            <tr key={request.id} className="hover:bg-gray-800">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fire-yellow to-orange-600 flex items-center justify-center">
                                    <span className="text-primary-dark text-xs font-bold">U</span>
                                  </div>
                                  <span className="font-medium">{request.userId.slice(0, 8)}...</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-fire-yellow font-bold text-lg">৳{request.amount}</span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span>{getPaymentMethodIcon(request.paymentMethod)}</span>
                                    <span className="font-medium capitalize">{request.paymentMethod}</span>
                                  </div>
                                  <p className="text-sm text-secondary">From: {request.senderWallet}</p>
                                  <p className="text-sm text-secondary">TXN: {request.transactionId}</p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-secondary" />
                                  <span className="text-sm">{formatDateTime(request.createdAt)}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <Badge className={getStatusColor(request.status)}>
                                  {request.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-6">
                                {request.status === "pending" && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleBalanceRequestUpdate(request.id, "approved")}
                                      disabled={updateBalanceRequestMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleBalanceRequestUpdate(request.id, "rejected")}
                                      disabled={updateBalanceRequestMutation.isPending}
                                      className="text-red-400 hover:text-red-300 border-red-400"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                                {request.status !== "pending" && (
                                  <span className="text-sm text-secondary">
                                    {request.status === "approved" ? "Approved" : "Rejected"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <DollarSign className="w-16 h-16 text-secondary mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Balance Requests</h3>
                      <p className="text-secondary">No balance requests to review at the moment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Withdraw Requests */}
            <TabsContent value="withdraw">
              <Card className="bg-secondary-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-fire-yellow">Withdraw Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {withdrawLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" className="text-fire-yellow" />
                    </div>
                  ) : withdrawRequests && withdrawRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-sm">User</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Amount</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Payment Details</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Date</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                            <th className="text-left py-4 px-6 font-semibold text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {withdrawRequests.map((request: any) => (
                            <tr key={request.id} className="hover:bg-gray-800">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fire-yellow to-orange-600 flex items-center justify-center">
                                    <span className="text-primary-dark text-xs font-bold">U</span>
                                  </div>
                                  <span className="font-medium">{request.userId.slice(0, 8)}...</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-red-400 font-bold text-lg">৳{request.amount}</span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span>{getPaymentMethodIcon(request.paymentMethod)}</span>
                                    <span className="font-medium capitalize">{request.paymentMethod}</span>
                                  </div>
                                  <p className="text-sm text-secondary">To: {request.receiverWallet}</p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-secondary" />
                                  <span className="text-sm">{formatDateTime(request.createdAt)}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <Badge className={getStatusColor(request.status)}>
                                  {request.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-6">
                                {request.status === "pending" && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleWithdrawRequestUpdate(request.id, "completed")}
                                      disabled={updateWithdrawRequestMutation.isPending}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleWithdrawRequestUpdate(request.id, "rejected")}
                                      disabled={updateWithdrawRequestMutation.isPending}
                                      className="text-red-400 hover:text-red-300 border-red-400"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                                {request.status !== "pending" && (
                                  <span className="text-sm text-secondary">
                                    {request.status === "completed" ? "Completed" : "Rejected"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <ArrowUp className="w-16 h-16 text-secondary mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Withdraw Requests</h3>
                      <p className="text-secondary">No withdraw requests to process at the moment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
