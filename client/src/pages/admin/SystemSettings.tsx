import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Save, DollarSign, ArrowUp, ArrowDown, Facebook, MessageCircle, Phone } from "lucide-react";

export default function SystemSettings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
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

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      return apiRequest("PUT", `/api/admin/settings/${key}`, { value, description }, token);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "সেটিং আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setEditingSettings({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createSettingMutation = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      return apiRequest("POST", "/api/admin/settings", { key, value, description }, token);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "নতুন সেটিং যোগ হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setEditingSettings({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = (key: string, value: string, description?: string) => {
    const setting = settings?.find((s: any) => s.key === key);
    
    if (setting) {
      updateSettingMutation.mutate({ key, value, description });
    } else {
      createSettingMutation.mutate({ key, value, description });
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings?.find((s: any) => s.key === key);
    return setting?.value || "";
  };

  const isEditing = (key: string) => {
    return editingSettings[key] !== undefined;
  };

  const startEditing = (key: string) => {
    setEditingSettings(prev => ({ ...prev, [key]: getSettingValue(key) }));
  };

  const cancelEditing = (key: string) => {
    setEditingSettings(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const defaultSettings = [
    {
      key: "min_balance_add",
      label: "নূন্যতম ব্যালেন্স অ্যাড",
      description: "ব্যবহারকারীরা সর্বনিম্ন কত টাকা অ্যাড করতে পারবে",
      icon: <ArrowDown className="w-4 h-4" />,
      placeholder: "100",
      type: "number"
    },
    {
      key: "max_balance_add",
      label: "সর্বোচ্চ ব্যালেন্স অ্যাড",
      description: "ব্যবহারকারীরা সর্বোচ্চ কত টাকা অ্যাড করতে পারবে",
      icon: <ArrowUp className="w-4 h-4" />,
      placeholder: "1000",
      type: "number"
    },
    {
      key: "min_withdraw",
      label: "নূন্যতম উত্তোলন",
      description: "ব্যবহারকারীরা সর্বনিম্ন কত টাকা উত্তোলন করতে পারবে",
      icon: <ArrowDown className="w-4 h-4" />,
      placeholder: "100",
      type: "number"
    },
    {
      key: "max_withdraw",
      label: "সর্বোচ্চ উত্তোলন",
      description: "ব্যবহারকারীরা সর্বোচ্চ কত টাকা উত্তোলন করতে পারবে",
      icon: <ArrowUp className="w-4 h-4" />,
      placeholder: "1000",
      type: "number"
    }
  ];

  const socialMediaSettings = [
    {
      key: "social_facebook",
      label: "Facebook Messenger",
      description: "Facebook Messenger link for customer support",
      icon: <Facebook className="w-5 h-5" />,
      type: "url",
      placeholder: "https://m.me/yourpage",
    },
    {
      key: "social_telegram",
      label: "Telegram",
      description: "Telegram link for customer support",
      icon: <MessageCircle className="w-5 h-5" />,
      type: "url",
      placeholder: "https://t.me/yourusername",
    },
    {
      key: "social_whatsapp",
      label: "WhatsApp",
      description: "WhatsApp link for customer support",
      icon: <Phone className="w-5 h-5" />,
      type: "url",
      placeholder: "https://wa.me/8801234567890",
    },
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
                <Settings className="w-4 h-4 mr-2 inline" />
                System Settings
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">System Settings</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" className="text-fire-yellow" />
            </div>
          ) : (
            <>
              {/* Financial Settings */}
              <div className="col-span-full mb-8">
                <h3 className="text-xl font-bold mb-4 text-fire-yellow">Financial Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {defaultSettings.map((setting) => (
                    <Card key={setting.key} className="bg-secondary-dark border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-fire-yellow">
                          {setting.icon}
                          <span>{setting.label}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-secondary mb-4">{setting.description}</p>
                        
                        {isEditing(setting.key) ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={setting.key}>
                                {setting.type === "url" ? "URL" : "Amount (৳)"}
                              </Label>
                              <Input
                                id={setting.key}
                                type={setting.type}
                                value={editingSettings[setting.key]}
                                onChange={(e) => setEditingSettings(prev => ({ 
                                  ...prev, 
                                  [setting.key]: e.target.value 
                                }))}
                                placeholder={setting.placeholder}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleSave(setting.key, editingSettings[setting.key], setting.description)}
                                disabled={updateSettingMutation.isPending || createSettingMutation.isPending}
                                className="flex-1 bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                              >
                                {updateSettingMutation.isPending || createSettingMutation.isPending ? (
                                  <LoadingSpinner className="mr-2" size="sm" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                Save
                              </Button>
                              <Button
                                onClick={() => cancelEditing(setting.key)}
                                variant="outline"
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-fire-yellow">৳{getSettingValue(setting.key) || setting.placeholder}</p>
                              <p className="text-sm text-secondary">Current Value</p>
                            </div>
                            <Button
                              onClick={() => startEditing(setting.key)}
                              variant="outline"
                              className="border-fire-yellow text-fire-yellow hover:bg-fire-yellow hover:text-primary-dark"
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Social Media Settings */}
              <div className="col-span-full mb-8">
                <h3 className="text-xl font-bold mb-4 text-fire-yellow">Social Media Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {socialMediaSettings.map((setting) => (
                    <Card key={setting.key} className="bg-secondary-dark border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-fire-yellow">
                          {setting.icon}
                          <span>{setting.label}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-secondary mb-4">{setting.description}</p>
                        
                        {isEditing(setting.key) ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={setting.key}>URL</Label>
                              <Input
                                id={setting.key}
                                type="url"
                                value={editingSettings[setting.key]}
                                onChange={(e) => setEditingSettings(prev => ({ 
                                  ...prev, 
                                  [setting.key]: e.target.value 
                                }))}
                                placeholder={setting.placeholder}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleSave(setting.key, editingSettings[setting.key], setting.description)}
                                disabled={updateSettingMutation.isPending || createSettingMutation.isPending}
                                className="flex-1 bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                              >
                                {updateSettingMutation.isPending || createSettingMutation.isPending ? (
                                  <LoadingSpinner className="mr-2" size="sm" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                Save
                              </Button>
                              <Button
                                onClick={() => cancelEditing(setting.key)}
                                variant="outline"
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-secondary break-all">
                                {getSettingValue(setting.key) || "Not set"}
                              </p>
                              <p className="text-xs text-secondary">Current URL</p>
                            </div>
                            <Button
                              onClick={() => startEditing(setting.key)}
                              variant="outline"
                              className="border-fire-yellow text-fire-yellow hover:bg-fire-yellow hover:text-primary-dark"
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
