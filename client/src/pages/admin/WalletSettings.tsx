import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAdminWalletSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Wallet, CreditCard, Smartphone, Rocket } from "lucide-react";

export default function WalletSettings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["/api/admin/wallets"],
    queryFn: async () => {
      const response = await fetch("/api/admin/wallets", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch wallets");
      }
      return response.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(insertAdminWalletSchema),
    defaultValues: {
      paymentMethod: "bkash" as const,
      walletNumber: "",
      isActive: true,
    },
  });

  const saveWalletMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/wallets", data, token);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Wallet settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets/active"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getWalletIcon = (method: string) => {
    switch (method) {
      case "bkash": return <Smartphone className="w-6 h-6 text-pink-500" />;
      case "nagad": return <CreditCard className="w-6 h-6 text-orange-500" />;
      case "rocket": return <Rocket className="w-6 h-6 text-purple-500" />;
      default: return <Wallet className="w-6 h-6 text-gray-500" />;
    }
  };

  const getWalletColor = (method: string) => {
    switch (method) {
      case "bkash": return "border-pink-500 bg-pink-500 bg-opacity-10";
      case "nagad": return "border-orange-500 bg-orange-500 bg-opacity-10";
      case "rocket": return "border-purple-500 bg-purple-500 bg-opacity-10";
      default: return "border-gray-500 bg-gray-500 bg-opacity-10";
    }
  };

  const getExistingWallet = (method: string) => {
    return wallets?.find((w: any) => w.paymentMethod === method);
  };

  const handleSaveWallet = (method: string, walletNumber: string, isActive: boolean) => {
    saveWalletMutation.mutate({
      paymentMethod: method,
      walletNumber,
      isActive,
    });
  };

  const paymentMethods = [
    { id: "bkash", name: "bKash", description: "Mobile Financial Service" },
    { id: "nagad", name: "Nagad", description: "Digital Financial Service" },
    { id: "rocket", name: "Rocket", description: "Mobile Banking Service" },
  ];

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
                <Wallet className="w-4 h-4 mr-2 inline" />
                Wallet Settings
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Wallet Settings</h2>
              <p className="text-secondary">Configure payment wallet numbers for user transactions</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" className="text-fire-yellow" />
            </div>
          ) : (
            <div className="space-y-6">
              {paymentMethods.map((method) => {
                const existingWallet = getExistingWallet(method.id);
                
                return (
                  <Card 
                    key={method.id} 
                    className={`bg-secondary-dark border-2 ${getWalletColor(method.id)}`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        {getWalletIcon(method.id)}
                        <div>
                          <h3 className="text-xl">{method.name}</h3>
                          <p className="text-sm text-secondary font-normal">{method.description}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            const walletNumber = formData.get(`${method.id}_number`) as string;
                            const isActive = formData.get(`${method.id}_active`) === "on";
                            handleSaveWallet(method.id, walletNumber, isActive);
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-2">
                              <label htmlFor={`${method.id}_number`} className="block text-sm font-medium mb-2">
                                Wallet Number
                              </label>
                              <Input
                                id={`${method.id}_number`}
                                name={`${method.id}_number`}
                                type="text"
                                placeholder={`Enter ${method.name} wallet number`}
                                defaultValue={existingWallet?.walletNumber || ""}
                                className="bg-primary-dark border-gray-600"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`${method.id}_active`}
                                  name={`${method.id}_active`}
                                  defaultChecked={existingWallet?.isActive ?? true}
                                />
                                <label htmlFor={`${method.id}_active`} className="text-sm">
                                  Active
                                </label>
                              </div>
                              
                              <Button
                                type="submit"
                                disabled={saveWalletMutation.isPending}
                                className="bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                              >
                                {saveWalletMutation.isPending && <LoadingSpinner className="mr-2" size="sm" />}
                                Save
                              </Button>
                            </div>
                          </div>
                        </form>
                      </Form>

                      {existingWallet && (
                        <div className="mt-4 p-4 bg-primary-dark rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-secondary">Current Settings</p>
                              <p className="font-mono text-lg">{existingWallet.walletNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-secondary">Status</p>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                existingWallet.isActive 
                                  ? 'bg-green-500 bg-opacity-20 text-green-400' 
                                  : 'bg-red-500 bg-opacity-20 text-red-400'
                              }`}>
                                {existingWallet.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Information Card */}
              <Card className="bg-blue-500 bg-opacity-10 border-blue-500 border-opacity-30">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mt-1">
                      <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-400 mb-2">Important Information</h4>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• These wallet numbers will be displayed to users when they request to add money</li>
                        <li>• Only active wallets will be shown to users</li>
                        <li>• Make sure to verify all transactions manually before approving balance requests</li>
                        <li>• Double-check wallet numbers before saving to avoid payment issues</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
