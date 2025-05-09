import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CloseIcon } from "@/lib/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function LoginModal() {
  const { isLoginModalOpen, loginError, login, closeLoginModal, showRegisterModal } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await login(data);
  });

  const handleSwitchToRegister = () => {
    closeLoginModal();
    showRegisterModal();
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={closeLoginModal}
        ></div>
        <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-title font-bold text-primary-800">Login to Your Account</h2>
            <button 
              className="text-primary-400 hover:text-primary-600" 
              onClick={closeLoginModal}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          
          {loginError && (
            <div className="mb-4 p-2 bg-red-100 text-red-800 rounded text-sm">
              {loginError}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
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
                      <Input
                        type="password"
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="remember"
                        />
                      </FormControl>
                      <FormLabel htmlFor="remember" className="text-sm font-normal cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <a href="#" className="text-sm text-secondary-600 hover:text-secondary-800">
                  Forgot password?
                </a>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-primary-700 hover:bg-primary-800 text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-primary-600">
              Don't have an account?{" "}
              <button
                className="text-secondary-600 font-medium hover:text-secondary-800"
                onClick={handleSwitchToRegister}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
