import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PackageIcon, ChevronLeftIcon, HomeIcon, UserIcon, CreditCardIcon, LogOutIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { format } from "date-fns";

export default function OrderHistory() {
  const { user, isAuthenticated, logout } = useAuth();
  const [_, navigate] = useLocation();
  
  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Order History | BookHaven</title>
        <meta name="description" content="View your order history and track your BookHaven purchases." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 mb-12">
        <Button
          variant="ghost"
          className="mb-6 text-primary-600"
          onClick={() => navigate("/")}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-2xl md:text-3xl font-title font-bold text-primary-800 mb-6">
          My Orders
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
                  <a href="/account" className="flex items-center p-3 hover:bg-muted transition-colors">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </a>
                  <a href="/orders" className="flex items-center p-3 hover:bg-muted transition-colors border-l-2 border-secondary-500">
                    <PackageIcon className="h-4 w-4 mr-2" />
                    <span>Orders</span>
                  </a>
                  <a href="/account#payment" className="flex items-center p-3 hover:bg-muted transition-colors">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    <span>Payment Methods</span>
                  </a>
                  <a href="/account#addresses" className="flex items-center p-3 hover:bg-muted transition-colors">
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
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-md"></div>
                      </div>
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Placed on {formatDate(order.createdAt.toString())}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="mt-3 flex justify-between">
                          <p className="text-sm">
                            <span className="font-medium">Total:</span> ${order.totalAmount.toFixed(2)}
                          </p>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't placed any orders yet. Start shopping to see your orders here.
                    </p>
                    <Button onClick={() => navigate("/books")}>Browse Books</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
