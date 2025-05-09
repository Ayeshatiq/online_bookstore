import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { BookCard } from "@/components/ui/card-book";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownIcon } from "@/lib/icons";

export default function FeaturedBooksSection() {
  const [sortBy, setSortBy] = useState("popular");
  const [visibleBooks, setVisibleBooks] = useState(8);

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ['/api/books', 'featured', sortBy],
  });

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const loadMoreBooks = () => {
    setVisibleBooks(prev => prev + 8);
  };

  if (isLoading) {
    return (
      <section id="featured" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-title font-bold text-primary-800">
              Featured Books
            </h2>
            <div className="animate-pulse w-32 h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-title font-bold text-primary-800">
            Featured Books
          </h2>
          <div className="flex items-center">
            <label htmlFor="sort-by" className="text-sm text-primary-600 mr-2">
              Sort by:
            </label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="text-sm border border-gray-300 rounded-md p-1.5 w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popularity</SelectItem>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books?.slice(0, visibleBooks).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {books && visibleBooks < books.length && (
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline" 
              onClick={loadMoreBooks}
              className="flex items-center bg-white border border-primary-300 hover:border-primary-500 text-primary-700"
            >
              Load More Books
              <ArrowDownIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
