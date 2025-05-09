import { Link } from "wouter";
import { 
  BookOpenIcon, 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  PinterestIcon 
} from "@/lib/icons";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <BookOpenIcon className="text-2xl text-secondary-500 mr-2" />
              <span className="text-xl font-title font-bold">BookHaven</span>
            </div>
            <p className="text-black font-medium text-sm mb-4">
              Your destination for literary adventures and knowledge exploration.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-black hover:text-secondary-500 transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-secondary-500 transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-secondary-500 transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-secondary-500 transition-colors">
                <PinterestIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-title font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/books?filter=new" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/books?filter=bestsellers" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/books?filter=offers" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Special Offers
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/books?filter=sets" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Book Sets
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-title font-bold text-lg mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-title font-bold text-lg mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-black font-medium hover:text-secondary-500 transition-colors">
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-primary-800 text-center text-black font-medium text-sm">
          <p>&copy; {new Date().getFullYear()} BookHaven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
