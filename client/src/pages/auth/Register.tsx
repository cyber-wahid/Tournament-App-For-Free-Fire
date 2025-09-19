import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Register() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      freeFireUID: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Registration data being sent:', data);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();
      
      // Auto login after registration
      await login({ usernameOrEmail: data.username, password: data.password }, 'user');
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
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="freeFireUID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Free Fire UID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your Free Fire UID (9 digits)" 
                        {...field}
                        maxLength={9}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Your Free Fire UID is required for tournament participation and prize distribution.
                    </p>
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-fire-yellow text-primary-dark hover:bg-fire-yellow/90"
                disabled={isLoading}
              >
                {isLoading && <LoadingSpinner className="mr-2" size="sm" />}
                Sign Up
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-fire-yellow hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
