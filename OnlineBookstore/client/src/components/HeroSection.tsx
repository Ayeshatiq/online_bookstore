import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-primary-900 py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-title font-bold leading-tight text-black">
              Discover Your Next Favorite Book
            </h1>
            <p className="text-lg text-black font-medium">
              Explore our vast collection of bestsellers, classics, and hidden gems. 
              Free shipping on orders over $35.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Button 
                asChild
                className="bg-secondary-500 hover:bg-secondary-600 px-6 py-6 rounded-md font-semibold transition-colors text-black"
              >
                <Link href="#featured">Browse Books</Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                className="bg-transparent border border-black hover:bg-secondary-500 hover:text-black px-6 py-6 rounded-md font-semibold transition-colors text-black"
              >
                <Link href="#categories">View Categories</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&h=500" 
              alt="Collection of books" 
              className="rounded-lg shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
