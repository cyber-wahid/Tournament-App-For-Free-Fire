import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getAuthHeaders } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Users, Search, Mail, Calendar, Wallet, Plus, Minus, Edit3 } from "lucide-react";

export default function UserManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundOperation, setFundOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUIDDialogOpen, setIsUIDDialogOpen] = useState(false);
  const [uidEditUser, setUidEditUser] = useState<any>(null);
  const [newUID, setNewUID] = useState("");
  const [uidChangeReason, setUidChangeReason] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount, operation }: { userId: string; amount: string; operation: 'add' | 'subtract' | 'set' }) => {
      console.log('Updating balance:', { userId, amount, operation });
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/balance`, { amount, operation }, token);
      console.log('Balance update response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Balance update success:', data);
      toast({
        title: "Success!",
        description: "User balance updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      
      // Force refresh all user-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      
      setIsDialogOpen(false);
      setFundAmount("");
      setSelectedUser(null);
    },
    onError: (error: any) => {
      console.error('Balance update error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUIDMutation = useMutation({
    mutationFn: async ({ userId, freeFireUID, changeReason }: { userId: string; freeFireUID: string; changeReason?: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/uid`, { freeFireUID, changeReason }, token);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Free Fire UID updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsUIDDialogOpen(false);
      setUidEditUser(null);
      setNewUID("");
      setUidChangeReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const filteredUsers = users ? users.filter((user: any) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.freeFireUID?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleFundOperation = () => {
    if (!selectedUser || !fundAmount) return;
    
    updateBalanceMutation.mutate({
      userId: selectedUser.id,
      amount: fundAmount,
      operation: fundOperation,
    });
  };

  const handleEditUID = (user: any) => {
    setUidEditUser(user);
    setNewUID(user.freeFireUID || "");
    setUidChangeReason("");
    setIsUIDDialogOpen(true);
  };

  const handleUIDUpdate = () => {
    if (!uidEditUser || !newUID) return;
    
    updateUIDMutation.mutate({
      userId: uidEditUser.id,
      freeFireUID: newUID,
      changeReason: uidChangeReason,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-500 bg-opacity-20 text-green-400' 
      : 'bg-red-500 bg-opacity-20 text-red-400';
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
                <Users className="w-4 h-4 mr-2 inline" />
                Users
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">User Management</h2>
          </div>

          {/* Search */}
          <Card className="bg-secondary-dark border-gray-700 mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
                <Input
                  placeholder="Search users by username, email, or Free Fire UID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-secondary-dark border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-fire-yellow bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Users className="text-fire-yellow w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-fire-yellow">{users?.length || 0}</p>
                    <p className="text-sm text-secondary">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary-dark border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Users className="text-green-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {users?.filter((u: any) => parseFloat(u.balance || 0) > 0).length || 0}
                    </p>
                    <p className="text-sm text-secondary">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary-dark border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-fire-yellow bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Wallet className="text-fire-yellow w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-fire-yellow">
                      ৳{users?.reduce((sum: number, u: any) => sum + parseFloat(u.balance || 0), 0).toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-secondary">Total Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" className="text-fire-yellow" />
            </div>
          ) : (
            <Card className="bg-secondary-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-fire-yellow">All Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-sm">User</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Free Fire UID</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Balance</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Tournaments</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Joined</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredUsers.map((user: any) => (
                          <tr key={user.id} className="hover:bg-gray-800">
                            <td className="py-4 px-6">
                              <div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fire-yellow to-orange-600 flex items-center justify-center">
                                    <span className="text-primary-dark text-xs font-bold">
                                      {user.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.username}</p>
                                    <div className="flex items-center space-x-1">
                                      <Mail className="w-3 h-3 text-secondary" />
                                      <p className="text-sm text-secondary">{user.email}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                                  {user.freeFireUID || 'Not set'}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                                  onClick={() => handleEditUID(user)}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Wallet className="w-4 h-4 text-fire-yellow" />
                                  <span className="text-fire-yellow font-medium">৳{user.balance}</span>
                                </div>
                                <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                  setIsDialogOpen(open);
                                  if (!open) {
                                    setSelectedUser(null);
                                    setFundAmount("");
                                  }
                                }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs border-fire-yellow text-fire-yellow hover:bg-fire-yellow hover:text-primary-dark"
                                      onClick={() => setSelectedUser(user)}
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-secondary-dark border-gray-700">
                                    <DialogHeader>
                                      <DialogTitle className="text-fire-yellow">
                                        Manage Funds - {user.username}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Current Balance</Label>
                                        <p className="text-2xl font-bold text-fire-yellow">৳{user.balance}</p>
                                      </div>
                                      <div>
                                        <Label htmlFor="operation">Operation</Label>
                                        <Select value={fundOperation} onValueChange={(value: any) => setFundOperation(value)}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="add">Add Money</SelectItem>
                                            <SelectItem value="subtract">Subtract Money</SelectItem>
                                            <SelectItem value="set">Set Balance</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label htmlFor="amount">Amount (৳)</Label>
                                        <Input
                                          id="amount"
                                          type="number"
                                          value={fundAmount}
                                          onChange={(e) => setFundAmount(e.target.value)}
                                          placeholder="Enter amount"
                                        />
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          onClick={handleFundOperation}
                                          disabled={!fundAmount || updateBalanceMutation.isPending}
                                          className="flex-1 bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                                        >
                                          {updateBalanceMutation.isPending ? (
                                            <LoadingSpinner className="mr-2" size="sm" />
                                          ) : fundOperation === 'add' ? (
                                            <Plus className="w-4 h-4 mr-2" />
                                          ) : fundOperation === 'subtract' ? (
                                            <Minus className="w-4 h-4 mr-2" />
                                          ) : (
                                            <Edit3 className="w-4 h-4 mr-2" />
                                          )}
                                          {fundOperation === 'add' ? 'Add Money' : 
                                           fundOperation === 'subtract' ? 'Subtract Money' : 'Set Balance'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setIsDialogOpen(false);
                                            setSelectedUser(null);
                                            setFundAmount("");
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm">{user.tournamentsCount} tournaments</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-secondary" />
                                <span className="text-sm">{formatDate(user.createdAt)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Users className="w-16 h-16 text-secondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Users Found</h3>
                    <p className="text-secondary">
                      {searchTerm ? "No users match your search criteria." : "No users have registered yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* UID Edit Dialog */}
      <Dialog open={isUIDDialogOpen} onOpenChange={(open) => {
        setIsUIDDialogOpen(open);
        if (!open) {
          setUidEditUser(null);
          setNewUID("");
          setUidChangeReason("");
        }
      }}>
        <DialogContent className="bg-secondary-dark border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-fire-yellow">
              Edit Free Fire UID - {uidEditUser?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current UID</Label>
              <p className="text-sm text-secondary font-mono bg-gray-800 px-2 py-1 rounded">
                {uidEditUser?.freeFireUID || 'Not set'}
              </p>
            </div>
            <div>
              <Label htmlFor="newUID">New Free Fire UID</Label>
              <Input
                id="newUID"
                value={newUID}
                onChange={(e) => setNewUID(e.target.value)}
                placeholder="Enter new Free Fire UID (9 digits)"
                maxLength={9}
              />
            </div>
            <div>
              <Label htmlFor="changeReason">Reason for Change (Optional)</Label>
              <Input
                id="changeReason"
                value={uidChangeReason}
                onChange={(e) => setUidChangeReason(e.target.value)}
                placeholder="Enter reason for UID change"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleUIDUpdate}
                disabled={!newUID || updateUIDMutation.isPending}
                className="flex-1 bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
              >
                {updateUIDMutation.isPending ? (
                  <LoadingSpinner className="mr-2" size="sm" />
                ) : (
                  <Edit3 className="w-4 h-4 mr-2" />
                )}
                Update UID
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsUIDDialogOpen(false);
                  setUidEditUser(null);
                  setNewUID("");
                  setUidChangeReason("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
