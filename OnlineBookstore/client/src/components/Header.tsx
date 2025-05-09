import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { BookOpenIcon, SearchIcon, ShoppingCartIcon, MenuIcon, ChevronDownIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isAuthenticated, showLoginModal, showRegisterModal, logout } = useAuth();
  const { cartItems, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prevState => !prevState);
  };

  const toggleSearchBar = () => {
    setSearchBarOpen(prevState => !prevState);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const userInitials = user ? 
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : "GU";

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <BookOpenIcon className="text-2xl text-secondary-600 mr-2" />
              <span className="text-xl font-title font-bold text-primary-800">BookHaven</span>
            </Link>
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link href="/" className="text-primary-600 hover:text-primary-900 px-3 py-2 font-medium">
                Home
              </Link>
              <Link href="/books" className="text-primary-600 hover:text-primary-900 px-3 py-2 font-medium">
                Books
              </Link>
              <Link href="/books?view=categories" className="text-primary-600 hover:text-primary-900 px-3 py-2 font-medium">
                Categories
              </Link>
              <Link href="/about" className="text-primary-600 hover:text-primary-900 px-3 py-2 font-medium">
                About
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="p-2 text-primary-600 hover:text-primary-800 transition-colors"
                onClick={toggleSearchBar}
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <button
                className="p-2 text-primary-600 hover:text-primary-800 transition-colors"
                onClick={toggleCart}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              </button>
            </div>
            <div className="hidden md:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center text-primary-600 hover:text-primary-900">
                      <span className="mr-1">{user?.firstName}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/books">Manage Books</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    className="text-primary-600 hover:text-primary-900 font-medium"
                    onClick={showLoginModal}
                  >
                    Login
                  </button>
                  <Button 
                    variant="default" 
                    className="bg-secondary-500 hover:bg-secondary-600 text-white"
                    onClick={showRegisterModal}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
            <div className="md:hidden">
              <button
                className="p-2 text-primary-600 hover:text-primary-800 transition-colors"
                onClick={toggleMobileMenu}
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md">
              Home
            </Link>
            <Link href="/books" className="block px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md">
              Books
            </Link>
            <Link href="/books?view=categories" className="block px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md">
              Categories
            </Link>
            <Link href="/about" className="block px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md">
              About
            </Link>
            <div className="pt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <Link href="/account" className="block px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md">
                    My Account
                  </Link>
                  <Link href="/orders" className="block px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md">
                    My Orders
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/admin/books" className="block px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md">
                      Manage Books
                    </Link>
                  )}
                  <button
                    className="block w-full text-left px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="block px-3 py-2 text-primary-600 hover:bg-primary-100 rounded-md w-full text-left"
                    onClick={() => {
                      showLoginModal();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </button>
                  <button
                    className="block px-3 py-2 bg-secondary-500 text-white rounded-md w-full text-left"
                    onClick={() => {
                      showRegisterModal();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {searchBarOpen && (
        <div className="bg-white border-t">
          <div className="container mx-auto px-4 py-3">
            <form className="flex items-center" onSubmit={(e) => {
              e.preventDefault();
              const searchInput = (e.target as HTMLFormElement).querySelector('input')?.value;
              if (searchInput) {
                window.location.href = `/books?search=${encodeURIComponent(searchInput)}`;
                setSearchBarOpen(false);
              }
            }}>
              <input
                type="text"
                placeholder="Search for books..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button type="submit" className="rounded-l-none">
                <SearchIcon className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
