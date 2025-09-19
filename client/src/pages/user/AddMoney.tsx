import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBalanceRequestSchema } from "@shared/schema";
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
import { PlusCircle, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";


export default function AddMoney() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin wallets for display
  const { data: wallets, isLoading: walletsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/wallets/active"],
  });

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

  const minAmount = getSettingValue("min_balance_add", "20");
  const maxAmount = getSettingValue("max_balance_add", "1000");

  const form = useForm({
    resolver: zodResolver(z.object({
      amount: z.string().min(1, "Amount is required").refine((val) => {
        const num = parseFloat(val);
        const min = parseFloat(minAmount);
        const max = parseFloat(maxAmount);
        return !isNaN(num) && num >= min && num <= max;
      }, `Amount must be between ৳${minAmount} and ৳${maxAmount}`),
      paymentMethod: z.enum(["bkash", "nagad", "rocket"]),
      senderWallet: z.string().min(1, "Sender wallet is required").max(11, "Wallet number must be 11 digits").refine((val) => /^\d{11}$/.test(val), "Wallet number must be exactly 11 digits"),
      transactionId: z.string().min(1, "Transaction ID is required"),
    })),
    defaultValues: {
      amount: "",
      paymentMethod: "bkash" as const,
      senderWallet: "",
      transactionId: "",
    },
  });

  const addMoneyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/user/balance/request", data, token);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "Your balance request has been submitted for approval",
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
    console.log("Form data being submitted:", data);
    addMoneyMutation.mutate(data);
  };

  const getWalletForMethod = (method: string) => {
    return wallets?.find((w: any) => w.paymentMethod === method);
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <FloatingHeader />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <PlusCircle className="w-12 h-12 text-fire-yellow mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-fire-yellow">Add Money</h1>
            <p className="text-secondary">Top up your wallet balance</p>
          </div>

          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="text-fire-yellow">Payment Details</CardTitle>
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

                  {/* Display admin wallet for selected method */}
                  {form.watch("paymentMethod") && !walletsLoading && (
                    <div className="bg-primary-dark rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="w-4 h-4 text-fire-yellow" />
                        <span className="font-medium text-fire-yellow">Send Money To:</span>
                      </div>
                      <p className="text-lg font-mono">
                        {getWalletForMethod(form.watch("paymentMethod"))?.walletNumber || "Not available"}
                      </p>
                      <p className="text-sm text-secondary mt-1">
                        Send money to this number and enter the transaction details below
                      </p>
                    </div>
                  )}

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
                            max={maxAmount}
                            step="1"
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value;
                              // Ensure it's a valid number
                              if (value && !isNaN(parseFloat(value))) {
                                field.onChange(value);
                              } else if (value === '') {
                                field.onChange('');
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="senderWallet"
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
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transactionId"
                    render={({ field }) => {
                      const paymentMethod = form.watch("paymentMethod");
                      let maxLength = 10; // Default for bKash
                      let placeholder = "Enter transaction ID (10 characters)";
                      
                      if (paymentMethod === "nagad") {
                        maxLength = 8;
                        placeholder = "Enter transaction ID (8 characters)";
                      } else if (paymentMethod === "rocket") {
                        maxLength = 20;
                        placeholder = "Enter transaction ID";
                      }

                      return (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={placeholder}
                              maxLength={maxLength}
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value;
                                // Validate length based on payment method
                                if (value.length <= maxLength) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          {field.value && field.value.length > maxLength && (
                            <p className="text-red-400 text-sm">
                              Transaction ID must be {maxLength} characters or less for {paymentMethod}
                            </p>
                          )}
                        </FormItem>
                      );
                    }}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                    disabled={addMoneyMutation.isPending}
                  >
                    {addMoneyMutation.isPending && <LoadingSpinner className="mr-2" size="sm" />}
                    Submit Request
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 bg-blue-500 bg-opacity-10 rounded-lg border border-blue-500 border-opacity-30">
                <h4 className="font-medium text-blue-400 mb-2">How it works:</h4>
                <ol className="text-sm text-secondary space-y-1">
                  <li>1. Select your payment method</li>
                  <li>2. Send money to the displayed number</li>
                  <li>3. Enter the transaction details</li>
                  <li>4. Wait for admin approval</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
