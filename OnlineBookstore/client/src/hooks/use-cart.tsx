import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Book } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CartItem {
  bookId: number;
  quantity: number;
  id?: number;
  userId?: number;
}

interface CartContextProps {
  cartItems: CartItem[];
  cartOpen: boolean;
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  increaseQuantity: (bookId: number) => void;
  decreaseQuantity: (bookId: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items for authenticated users
  const { data: serverCartItems } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  // Sync server cart items with local state
  useEffect(() => {
    if (serverCartItems) {
      setCartItems(serverCartItems);
    }
  }, [serverCartItems]);

  // Load cart from localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, [isAuthenticated]);

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Cart mutations for authenticated users
  const addToCartMutation = useMutation({
    mutationFn: (item: CartItem) => apiRequest('POST', '/api/cart', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  const updateCartMutation = useMutation({
    mutationFn: (item: CartItem) => apiRequest('PATCH', `/api/cart/${item.bookId}`, { quantity: item.quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (bookId: number) => apiRequest('DELETE', `/api/cart/${bookId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/cart', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  // Cart operations
  const addToCart = (book: Book) => {
    // Check if book is already in cart
    const existingItemIndex = cartItems.findIndex(item => item.bookId === book.id);

    if (existingItemIndex !== -1) {
      // Book exists in cart, increase quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;

      if (isAuthenticated) {
        updateCartMutation.mutate(updatedItems[existingItemIndex]);
      } else {
        setCartItems(updatedItems);
      }
    } else {
      // Book doesn't exist in cart, add it
      const newItem: CartItem = {
        bookId: book.id,
        quantity: 1,
      };

      if (isAuthenticated) {
        addToCartMutation.mutate(newItem);
      } else {
        setCartItems(prev => [...prev, newItem]);
      }
    }
  };

  const removeFromCart = (bookId: number) => {
    if (isAuthenticated) {
      removeFromCartMutation.mutate(bookId);
    } else {
      setCartItems(prev => prev.filter(item => item.bookId !== bookId));
    }
  };

  const updateQuantity = (bookId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    if (isAuthenticated) {
      updateCartMutation.mutate({ bookId, quantity });
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.bookId === bookId ? { ...item, quantity } : item
        )
      );
    }
  };

  const increaseQuantity = (bookId: number) => {
    const item = cartItems.find(item => item.bookId === bookId);
    if (item) {
      updateQuantity(bookId, item.quantity + 1);
    }
  };

  const decreaseQuantity = (bookId: number) => {
    const item = cartItems.find(item => item.bookId === bookId);
    if (item && item.quantity > 1) {
      updateQuantity(bookId, item.quantity - 1);
    } else {
      removeFromCart(bookId);
    }
  };

  const clearCart = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const toggleCart = () => {
    setCartOpen(prev => !prev);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
