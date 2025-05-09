import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { UserIcon, CreditCardIcon, PackageIcon, HomeIcon, LogOutIcon } from "@/lib/icons";

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  // Personal details form state
  const [personalDetails, setPersonalDetails] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle personal details form change
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password form change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof personalDetails) => {
      return await apiRequest("PATCH", "/api/auth/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      return await apiRequest("PATCH", "/api/auth/password", data);
    },
    onSuccess: () => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle profile update submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(personalDetails);
  };

  // Handle password change submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate(passwordForm);
  };

  return (
    <MainLayout>
      <Helmet>
        <title>My Account | BookHaven</title>
        <meta name="description" content="Manage your BookHaven account settings and preferences." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 mb-12">
        <h1 className="text-2xl md:text-3xl font-title font-bold text-primary-800 mb-6">
          My Account
        </h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                        {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <a href="#profile" className="flex items-center p-3 hover:bg-muted transition-colors border-l-2 border-secondary-500">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </a>
                  <a href="/orders" className="flex items-center p-3 hover:bg-muted transition-colors">
                    <PackageIcon className="h-4 w-4 mr-2" />
                    <span>Orders</span>
                  </a>
                  <a href="#payment" className="flex items-center p-3 hover:bg-muted transition-colors">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    <span>Payment Methods</span>
                  </a>
                  <a href="#addresses" className="flex items-center p-3 hover:bg-muted transition-colors">
                    <HomeIcon className="h-4 w-4 mr-2" />
                    <span>Addresses</span>
                  </a>
                  <button 
                    className="flex items-center p-3 hover:bg-muted transition-colors text-left text-destructive"
                    onClick={logout}
                  >
                    <LogOutIcon className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            <Tabs defaultValue="personal-info" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="personal-info" className="flex-1">Personal Information</TabsTrigger>
                <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal-info" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            name="firstName" 
                            value={personalDetails.firstName} 
                            onChange={handleDetailsChange} 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            name="lastName" 
                            value={personalDetails.lastName} 
                            onChange={handleDetailsChange} 
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={personalDetails.email} 
                          onChange={handleDetailsChange} 
                          required 
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      form="profile-form"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          name="currentPassword" 
                          type="password" 
                          value={passwordForm.currentPassword} 
                          onChange={handlePasswordChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          name="newPassword" 
                          type="password" 
                          value={passwordForm.newPassword} 
                          onChange={handlePasswordChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword" 
                          type="password" 
                          value={passwordForm.confirmPassword} 
                          onChange={handlePasswordChange} 
                          required 
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      form="password-form"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
