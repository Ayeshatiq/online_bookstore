import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LoginInput, RegisterInput, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  loginError: string | null;
  registerError: string | null;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: () => void;
  closeLoginModal: () => void;
  showRegisterModal: () => void;
  closeRegisterModal: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsLoginModalOpen(false);
      setLoginError(null);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${data.firstName}!`,
      });
    },
    onError: (error: Error) => {
      setLoginError(error.message || 'Login failed');
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const { confirmPassword, terms, ...userData } = data;
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsRegisterModalOpen(false);
      setRegisterError(null);
      toast({
        title: "Account created successfully",
        description: `Welcome to BookHaven, ${data.firstName}!`,
      });
    },
    onError: (error: Error) => {
      setRegisterError(error.message || 'Registration failed');
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout', {});
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const login = async (data: LoginInput) => {
    setLoginError(null);
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterInput) => {
    setRegisterError(null);
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const showLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    setLoginError(null);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginError(null);
  };

  const showRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setRegisterError(null);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setRegisterError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isLoginModalOpen,
        isRegisterModalOpen,
        loginError,
        registerError,
        login,
        register,
        logout,
        showLoginModal,
        closeLoginModal,
        showRegisterModal,
        closeRegisterModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
