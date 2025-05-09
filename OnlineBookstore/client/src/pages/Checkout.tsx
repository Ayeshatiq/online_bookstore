import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from "@/components/layouts/MainLayout";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { CreditCardIcon, HomeIcon, PackageIcon, CheckIcon } from "@/lib/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Checkout() {
  const [_, navigate] = useLocation();
  const { cartItems, clearCart } = useCart();
  const { isAuthenticated, user, showLoginModal } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  // Fetch books data for cart items
  const { data: books } = useQuery<Book[]>({
    queryKey: ['/api/books'],
    enabled: cartItems.length > 0,
  });

  // Calculate totals
  const cartItemsWithDetails = cartItems.map(item => {
    const book = books?.find(book => book.id === item.bookId);
    return {
      ...item,
      book,
    };
  });

  const subtotal = cartItemsWithDetails.reduce(
    (total, item) => total + (item.book?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <Helmet>
          <title>Checkout | BookHaven</title>
          <meta name="description" content="Complete your book order at BookHaven." />
        </Helmet>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <PackageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-title font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any books to your cart yet.
            </p>
            <Button onClick={() => navigate("/books")}>Browse Books</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setStep(2);
  };

  // Handle payment form submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === "credit-card") {
      // Validate credit card form
      if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv) {
        toast({
          title: "Missing information",
          description: "Please fill out all payment fields.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Proceed to review
    setStep(3);
  };

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to checkout");
      }
      
      return await apiRequest("POST", "/api/checkout", { 
        items: cartItems,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        paymentMethod
      });
    },
    onSuccess: (data) => {
      clearCart();
      navigate(`/orders/${data.orderId}`);
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
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

  // Handle final checkout
  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      showLoginModal();
      return;
    }
    
    checkoutMutation.mutate();
  };

  // Order summary component (used in all steps)
  const OrderSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-title">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItemsWithDetails.map((item) => (
          <div key={item.bookId} className="flex justify-between text-sm pb-2 border-b border-gray-100">
            <div className="flex">
              <span>{item.quantity} x </span>
              <span className="ml-1 font-medium">{item.book?.title}</span>
            </div>
            <span>${((item.book?.price || 0) * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <Helmet>
        <title>Checkout | BookHaven</title>
        <meta name="description" content="Complete your book order at BookHaven." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 mb-12">
        <h1 className="text-2xl md:text-3xl font-title font-bold text-primary-800 mb-6 text-center">
          Checkout
        </h1>

        {/* Checkout steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${step >= 1 ? "text-secondary-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 1 ? "bg-secondary-100 text-secondary-600" : "bg-gray-100 text-gray-400"
              }`}>
                <HomeIcon className="h-5 w-5" />
              </div>
              <span className="text-sm">Shipping</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${step >= 2 ? "bg-secondary-500" : "bg-gray-200"}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? "text-secondary-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 2 ? "bg-secondary-100 text-secondary-600" : "bg-gray-100 text-gray-400"
              }`}>
                <CreditCardIcon className="h-5 w-5" />
              </div>
              <span className="text-sm">Payment</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${step >= 3 ? "bg-secondary-500" : "bg-gray-200"}`}></div>
            <div className={`flex flex-col items-center ${step >= 3 ? "text-secondary-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 3 ? "bg-secondary-100 text-secondary-600" : "bg-gray-100 text-gray-400"
              }`}>
                <CheckIcon className="h-5 w-5" />
              </div>
              <span className="text-sm">Review</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-title">Shipping Information</CardTitle>
                  <CardDescription>Enter your shipping details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          value={formData.firstName} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          value={formData.lastName} 
                          onChange={handleChange} 
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
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Textarea 
                        id="address" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          name="city" 
                          value={formData.city} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input 
                          id="state" 
                          name="state" 
                          value={formData.state} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                        <Input 
                          id="zipCode" 
                          name="zipCode" 
                          value={formData.zipCode} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input 
                          id="country" 
                          name="country" 
                          value={formData.country} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate("/books")}>
                    Continue Shopping
                  </Button>
                  <Button type="submit" form="shipping-form">
                    Continue to Payment
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-title">Payment Method</CardTitle>
                  <CardDescription>Select your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-6">
                    <RadioGroup 
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex flex-1 cursor-pointer">
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex flex-1 cursor-pointer">
                          <span className="font-bold text-blue-700 mr-1">Pay</span>
                          <span className="font-bold text-blue-900">Pal</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "credit-card" && (
                      <div className="space-y-4 mt-6 border p-4 rounded-md">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input 
                            id="cardNumber" 
                            name="cardNumber" 
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber} 
                            onChange={handleChange} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input 
                            id="cardName" 
                            name="cardName" 
                            placeholder="John Doe"
                            value={formData.cardName} 
                            onChange={handleChange} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardExpiry">Expiration Date</Label>
                            <Input 
                              id="cardExpiry" 
                              name="cardExpiry" 
                              placeholder="MM/YY"
                              value={formData.cardExpiry} 
                              onChange={handleChange} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardCvv">CVV</Label>
                            <Input 
                              id="cardCvv" 
                              name="cardCvv" 
                              placeholder="123"
                              value={formData.cardCvv} 
                              onChange={handleChange} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" form="payment-form">
                    Continue to Review
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 3: Review and Place Order */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-title">Review Your Order</CardTitle>
                  <CardDescription>Please review your order details before placing your order</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Shipping Information</h3>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.email}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                      <p>{formData.country}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="bg-muted p-3 rounded-md text-sm flex items-center">
                      {paymentMethod === "credit-card" ? (
                        <>
                          <CreditCardIcon className="h-4 w-4 mr-2" />
                          <span>Credit Card ending in {formData.cardNumber.slice(-4)}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-blue-700 mr-1">Pay</span>
                          <span className="font-bold text-blue-900">Pal</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <div className="bg-muted p-3 rounded-md divide-y divide-gray-200">
                      {cartItemsWithDetails.map((item) => (
                        <div key={item.bookId} className="py-2 flex justify-between">
                          <div>
                            <p className="font-medium">{item.book?.title}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p>${((item.book?.price || 0) * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="w-full flex justify-between font-medium text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="w-full flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={checkoutMutation.isPending}
                      className="bg-secondary-600 hover:bg-secondary-700"
                    >
                      {checkoutMutation.isPending ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Order Summary (shown on all steps) */}
          <div className="md:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
