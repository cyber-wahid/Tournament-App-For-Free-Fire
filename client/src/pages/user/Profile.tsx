import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import FloatingHeader from "@/components/layout/FloatingHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Wallet, LogOut, Edit, DollarSign, ArrowUp, ArrowDown, Calendar, RefreshCw, Facebook, MessageCircle, Phone } from "lucide-react";
import { getAuthHeaders } from "@/lib/authUtils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { openSocialLink } from "@/lib/socialMediaUtils";


export default function Profile() {
  const { user, logout, token, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    freeFireUID: user?.freeFireUID || "",
    password: "",
    confirmPassword: "",
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
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

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/user/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/user/transactions", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    },
  });

  // Fetch social media links
  const { data: socialMedia } = useQuery({
    queryKey: ["/api/social-media"],
    queryFn: async () => {
      const response = await fetch("/api/social-media");
      if (!response.ok) {
        throw new Error("Failed to fetch social media links");
      }
      return response.json();
    },
  });

  // Use fresh profile data if available, otherwise fall back to auth context
  const currentUser = userProfile || user;

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editData.username,
          freeFireUID: editData.freeFireUID,
          password: editData.password || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const updatedUser = await response.json();
      
      // Update the auth context with new user data
      refreshUser();
      
      setIsEditing(false);
      setEditData({
        username: updatedUser.username,
        freeFireUID: updatedUser.freeFireUID,
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error('Profile update failed:', error);
      // You might want to show a toast notification here
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500 bg-opacity-20 text-yellow-400";
      case "approved": return "bg-green-500 bg-opacity-20 text-green-400";
      case "completed": return "bg-blue-500 bg-opacity-20 text-blue-400";
      case "rejected": return "bg-red-500 bg-opacity-20 text-red-400";
      default: return "bg-gray-500 bg-opacity-20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <FloatingHeader />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Info */}
          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-fire-yellow">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <>
                  <div>
                    <Label className="text-secondary">Username</Label>
                    <p className="text-lg font-medium">{currentUser?.username}</p>
                  </div>
                  <div>
                    <Label className="text-secondary">Email</Label>
                    <p className="text-lg font-medium">{currentUser?.email}</p>
                  </div>
                  <div>
                    <Label className="text-secondary">Free Fire UID</Label>
                    <p className="text-lg font-medium">{currentUser?.freeFireUID || 'Not set'}</p>
                  </div>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full border-fire-yellow text-fire-yellow hover:bg-fire-yellow hover:text-primary-dark"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="freeFireUID">Free Fire UID</Label>
                    <Input
                      id="freeFireUID"
                      value={editData.freeFireUID}
                      onChange={(e) => setEditData({ ...editData, freeFireUID: e.target.value })}
                      placeholder="Enter your Free Fire UID (9 digits)"
                      maxLength={9}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your Free Fire UID is required for tournament participation and prize distribution.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="password">New Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={editData.password}
                      onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={editData.confirmPassword}
                      onChange={(e) => setEditData({ ...editData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleSave}
                      className="flex-1 bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                    >
                      Save
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Balance Info */}
          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-fire-yellow">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>Wallet Balance</span>
                </div>
                <Button
                  onClick={refreshUser}
                  variant="ghost"
                  size="sm"
                  className="text-fire-yellow hover:bg-fire-yellow hover:text-primary-dark"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-fire-yellow">৳{currentUser?.balance || '0.00'}</p>
                <p className="text-secondary">Available Balance</p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-fire-yellow">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" className="text-fire-yellow" />
                </div>
              ) : transactions ? (
                <Tabs defaultValue="balance" className="w-full">
                  <TabsList className="bg-gray-800 border-gray-700 mb-4">
                    <TabsTrigger value="balance" className="data-[state=active]:bg-fire-yellow data-[state=active]:text-primary-dark">
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Add Money
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" className="data-[state=active]:bg-fire-yellow data-[state=active]:text-primary-dark">
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Withdraw
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="balance" className="space-y-3">
                    {transactions.balanceRequests && transactions.balanceRequests.length > 0 ? (
                      transactions.balanceRequests.map((request: any) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                              <ArrowDown className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium">৳{request.amount}</p>
                              <p className="text-sm text-secondary">{request.paymentMethod}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <p className="text-xs text-secondary mt-1">{formatDate(request.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="w-12 h-12 text-secondary mx-auto mb-2" />
                        <p className="text-secondary">No balance requests yet</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="withdraw" className="space-y-3">
                    {transactions.withdrawRequests && transactions.withdrawRequests.length > 0 ? (
                      transactions.withdrawRequests.map((request: any) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                              <ArrowUp className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                              <p className="font-medium">৳{request.amount}</p>
                              <p className="text-sm text-secondary">{request.paymentMethod}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <p className="text-xs text-secondary mt-1">{formatDate(request.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ArrowUp className="w-12 h-12 text-secondary mx-auto mb-2" />
                        <p className="text-secondary">No withdraw requests yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <p className="text-secondary">Failed to load transactions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media Support */}
          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-fire-yellow">সাহায্য দরকার? এখুনি যোগাযোগ করুনঃ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {socialMedia?.facebook && (
                  <Button
                    onClick={() => openSocialLink(socialMedia.facebook)}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto p-4 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                  >
                    <Facebook className="w-6 h-6" />
                    <span className="text-xs">Facebook</span>
                  </Button>
                )}
                {socialMedia?.telegram && (
                  <Button
                    onClick={() => openSocialLink(socialMedia.telegram)}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto p-4 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-xs">Telegram</span>
                  </Button>
                )}
                {socialMedia?.whatsapp && (
                  <Button
                    onClick={() => openSocialLink(socialMedia.whatsapp)}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto p-4 border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                  >
                    <Phone className="w-6 h-6" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                )}
              </div>
              {(!socialMedia?.facebook && !socialMedia?.telegram && !socialMedia?.whatsapp) && (
                <p className="text-center text-secondary text-sm">
                  সাপোর্ট লিংক সেট করা হয়নি
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-fire-yellow">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={logout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
