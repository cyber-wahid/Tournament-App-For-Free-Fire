import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWithdrawRequestSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import FloatingHeader from "@/components/layout/FloatingHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAuthHeaders } from "@/lib/authUtils";
import { ArrowUp, Wallet, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";


export default function Withdraw() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system settings for limits
  const { data: settings } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings", {
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
  });

  const getSettingValue = (key: string, defaultValue: string) => {
    const setting = settings?.find((s: any) => s.key === key);
    return setting?.value || defaultValue;
  };

  const minAmount = getSettingValue("min_withdraw", "20");
  const maxAmount = getSettingValue("max_withdraw", "1000");

  const { data: userProfile } = useQuery({
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

  // Use fresh profile data if available, otherwise fall back to auth context
  const currentUser = userProfile || user;

  // Create dynamic schema based on settings
  const createDynamicSchema = () => {
    return z.object({
      amount: z.string().min(1, "Amount is required").refine((val) => {
        const num = parseFloat(val);
        const min = parseFloat(minAmount);
        const max = parseFloat(maxAmount);
        return !isNaN(num) && num >= min && num <= max;
      }, `Amount must be between ৳${minAmount} and ৳${maxAmount}`),
      paymentMethod: z.enum(["bkash", "nagad", "rocket"]),
      receiverWallet: z.string().min(1, "Receiver wallet is required").max(11, "Wallet number must be 11 digits").refine((val) => /^\d{11}$/.test(val), "Wallet number must be exactly 11 digits"),
    });
  };

  const form = useForm({
    resolver: zodResolver(createDynamicSchema()),
    defaultValues: {
      amount: "",
      paymentMethod: "bkash" as const,
      receiverWallet: "",
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/user/withdraw/request", data, token);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "Your withdraw request has been submitted for processing",
      });
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

  const onSubmit = (data: any) => {
    const withdrawAmount = parseFloat(data.amount);
    const userBalance = parseFloat(currentUser?.balance || "0");

    if (withdrawAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    // Validate wallet number length
    if (data.receiverWallet.length !== 11) {
      toast({
        title: "Invalid Wallet Number",
        description: "Wallet number must be exactly 11 digits",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate(data);
  };

  const userBalance = parseFloat(currentUser?.balance || "0");
  const watchedAmount = parseFloat(form.watch("amount") || "0");
  const watchedWallet = form.watch("receiverWallet") || "";
  
  // Check if form is valid for submission
  const isFormValid = () => {
    const amount = parseFloat(form.watch("amount") || "0");
    const wallet = form.watch("receiverWallet") || "";
    
    return (
      amount > 0 &&
      amount <= userBalance &&
      amount >= parseFloat(minAmount) &&
      amount <= parseFloat(maxAmount) &&
      wallet.length === 11 &&
      /^\d{11}$/.test(wallet)
    );
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <FloatingHeader />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <ArrowUp className="w-12 h-12 text-fire-yellow mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-fire-yellow">Withdraw Money</h1>
            <p className="text-secondary">Cash out your earnings</p>
          </div>

          {/* Balance Display */}
          <Card className="bg-secondary-dark border-gray-700 mb-6">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Wallet className="w-5 h-5 text-fire-yellow" />
                <span className="text-fire-yellow font-medium">Available Balance</span>
              </div>
              <p className="text-3xl font-bold text-fire-yellow">৳{currentUser?.balance || '0.00'}</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-fire-yellow">Withdrawal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bkash">bKash</SelectItem>
                            <SelectItem value="nagad">Nagad</SelectItem>
                            <SelectItem value="rocket">Rocket</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (৳)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={`Enter amount (৳${minAmount}-৳${maxAmount})`}
                            min={minAmount}
                            max={Math.min(parseFloat(maxAmount), userBalance)}
                            step="1"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        {watchedAmount > userBalance && (
                          <p className="text-red-400 text-sm">Amount exceeds available balance</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="receiverWallet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Wallet Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your wallet number (11 digits)" 
                            maxLength={11}
                            {...field} 
                            onChange={(e) => {
                              // Only allow numbers
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {field.value && field.value.length > 0 && field.value.length !== 11 && (
                          <p className="text-red-400 text-sm">Wallet number must be exactly 11 digits</p>
                        )}
                        {field.value && field.value.length === 11 && !/^\d{11}$/.test(field.value) && (
                          <p className="text-red-400 text-sm">Wallet number must contain only numbers</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                    disabled={withdrawMutation.isPending || !isFormValid()}
                  >
                    {withdrawMutation.isPending && <LoadingSpinner className="mr-2" size="sm" />}
                    Submit Request
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 bg-yellow-500 bg-opacity-10 rounded-lg border border-yellow-500 border-opacity-30">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-500 mb-1">Important Notes:</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Withdrawals are processed manually by admins</li>
                      <li>• Processing time: 24-48 hours</li>
                      <li>• Make sure your wallet number is correct</li>
                      <li>• Amount range: ৳20 - ৳1000</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
