import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await login(data, 'user');
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
                    <div className="h-16 flex items-center justify-center mx-auto mb-4">
            <img src="/ffclash.svg" alt="FF Clash" className="h-14 w-auto logo-svg" />
          </div>
            <CardDescription>আপনার অ্যাকাউন্টে সাইন ইন করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="usernameOrEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ব্যবহারকারীর নাম বা ইমেইল</FormLabel>
                    <FormControl>
                      <Input placeholder="ব্যবহারকারীর নাম বা ইমেইল লিখুন" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পাসওয়ার্ড</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="পাসওয়ার্ড লিখুন" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                disabled={isLoading}
              >
                {isLoading && <LoadingSpinner className="mr-2" size="sm" />}
                সাইন ইন
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-secondary">
              অ্যাকাউন্ট নেই?{" "}
              <Link href="/register" className="text-fire-yellow hover:underline">
                সাইন আপ করুন
              </Link>
            </p>
            <p className="text-sm text-secondary">
              পাসওয়ার্ড ভুলে গেছেন?{" "}
              <Link href="/forgot-password" className="text-fire-yellow hover:underline">
                পাসওয়ার্ড রিসেট করুন
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
