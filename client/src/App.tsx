import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useProgressBar } from "@/hooks/useProgressBar";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import AdminLogin from "@/pages/admin/AdminLogin";

// User pages
import Home from "@/pages/user/Home";
import Profile from "@/pages/user/Profile";
import MyTournaments from "@/pages/user/MyTournaments";
import AddMoney from "@/pages/user/AddMoney";
import Withdraw from "@/pages/user/Withdraw";

// Admin pages
import Dashboard from "@/pages/admin/Dashboard";
import TournamentManagement from "@/pages/admin/TournamentManagement";
import UserManagement from "@/pages/admin/UserManagement";
import RequestManagement from "@/pages/admin/RequestManagement";
import WalletSettings from "@/pages/admin/WalletSettings";
import SystemSettings from "@/pages/admin/SystemSettings";

import NotFound from "@/pages/not-found";

function AppRouter() {
  const { user, admin, isLoading, userType } = useAuth();
  const isProgressLoading = useProgressBar();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="text-center">
          <div className="w-8 h-8 bg-fire-yellow rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-fire text-primary-dark font-bold"></i>
          </div>
          <p className="text-fire-yellow">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProgressBar isLoading={isProgressLoading} />
      <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Default route - redirect based on auth status */}
      <Route path="/">
        {() => {
          if (user && userType === 'user') {
            return <Home />;
          } else if (admin && userType === 'admin') {
            // Redirect admin to admin dashboard instead of showing user home
            window.location.href = '/admin/superuserz';
            return null;
          } else {
            return <Login />;
          }
        }}
      </Route>

      {/* User routes */}
      {user && userType === 'user' && (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-tournaments" component={MyTournaments} />
          <Route path="/add-money" component={AddMoney} />
          <Route path="/withdraw" component={Withdraw} />
        </>
      )}

      {/* Admin routes */}
      {admin && userType === 'admin' && (
        <>
          <Route path="/admin" component={Dashboard} />
          <Route path="/admin/superuserz" component={Dashboard} />
          <Route path="/admin/superuserz/tournaments" component={TournamentManagement} />
          <Route path="/admin/superuserz/users" component={UserManagement} />
          <Route path="/admin/superuserz/requests" component={RequestManagement} />
          <Route path="/admin/superuserz/wallets" component={WalletSettings} />
          <Route path="/admin/superuserz/settings" component={SystemSettings} />
          <Route path="/admin/tournaments" component={TournamentManagement} />
          <Route path="/admin/users" component={UserManagement} />
          <Route path="/admin/requests" component={RequestManagement} />
          <Route path="/admin/wallets" component={WalletSettings} />
          <Route path="/admin/settings" component={SystemSettings} />
        </>
      )}

      {/* Check for admin paths and redirect to admin login if not authenticated */}
      <Route path="/admin/:rest*">
        {() => admin ? <NotFound /> : <AdminLogin />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
