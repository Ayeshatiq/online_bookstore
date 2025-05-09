import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Book } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { CloseIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

export default function ShoppingCart() {
  const { cartOpen, cartItems, toggleCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const { isAuthenticated, showLoginModal } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: books } = useQuery<Book[]>({
    queryKey: ['/api/books'],
    enabled: cartItems.length > 0,
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to checkout");
      }
      return await apiRequest("POST", "/api/checkout", { items: cartItems });
    },
    onSuccess: (data) => {
      clearCart();
      toggleCart();
      navigate(`/orders/${data.orderId}`);
      toast({
        title: "Order placed!",
        description: "Your order has been placed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
      
      if (error.message.includes("logged in")) {
        showLoginModal();
      }
    },
  });

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  // Find book details from cart items
  const cartItemsWithDetails = cartItems.map(item => {
    const book = books?.find(book => book.id === item.bookId);
    return {
      ...item,
      book,
    };
  });

  // Calculate totals
  const subtotal = cartItemsWithDetails.reduce(
    (total, item) => total + (item.book?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 35 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={toggleCart}
        ></div>
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md cart-slide transform translate-x-0">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-title font-bold text-primary-800">Shopping Cart</h2>
                  <button 
                    className="h-7 w-7 text-primary-400 hover:text-primary-600" 
                    onClick={toggleCart}
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-8">
                  {cartItems.length > 0 ? (
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {cartItemsWithDetails.map((item) => (
                          <li key={`${item.bookId}-${item.id}`} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                              <img 
                                src={item.book?.coverImage} 
                                alt={`${item.book?.title} book cover`} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-primary-800">
                                  <h3>{item.book?.title}</h3>
                                  <p className="ml-4">${(item.book?.price || 0).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-primary-500">By {item.book?.author}</p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center">
                                  <button 
                                    className="text-primary-400 hover:text-primary-600 p-1" 
                                    onClick={() => decreaseQuantity(item.bookId)}
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                  </button>
                                  <span className="mx-2 text-primary-700">{item.quantity}</span>
                                  <button 
                                    className="text-primary-400 hover:text-primary-600 p-1" 
                                    onClick={() => increaseQuantity(item.bookId)}
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </button>
                                </div>
                                <button 
                                  className="font-medium text-secondary-600 hover:text-secondary-800" 
                                  onClick={() => removeFromCart(item.bookId)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center">
                      <div className="text-center">
                        <ShoppingCartIcon className="h-12 w-12 text-primary-300 mb-3 mx-auto" />
                        <h3 className="text-lg font-medium text-primary-800 mb-1">Your cart is empty</h3>
                        <p className="text-primary-500">Looks like you haven't added any books yet.</p>
                        <Button
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-500 hover:bg-secondary-600"
                          onClick={toggleCart}
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-primary-800 mb-1">
                    <p>Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-primary-500 mb-4">
                    <p>Shipping</p>
                    <p>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-title font-bold text-primary-900">
                    <p>Total</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
                  <div className="mt-6">
                    <Button 
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-secondary-500 hover:bg-secondary-600 transition-colors"
                      onClick={handleCheckout}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? "Processing..." : "Proceed to Checkout"}
                    </Button>
                  </div>
                  <div className="mt-6 flex justify-center text-sm text-center text-primary-500">
                    <p>
                      or{" "}
                      <button 
                        className="text-secondary-600 font-medium hover:text-secondary-800" 
                        onClick={toggleCart}
                      >
                        Continue Shopping
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
