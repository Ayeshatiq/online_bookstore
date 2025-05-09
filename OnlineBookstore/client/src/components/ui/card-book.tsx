import { Book } from "@shared/schema";
import { useBookDetails } from "@/hooks/use-book-details";
import { useCart } from "@/hooks/use-cart";
import { BookIcon, StarIcon } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { openBookDetails } = useBookDetails();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book);
    toast({
      title: "Added to cart",
      description: `${book.title} has been added to your cart.`,
    });
  };

  return (
    <Card 
      className="book-card flex flex-col overflow-hidden cursor-pointer" 
      onClick={() => openBookDetails(book)}
    >
      <div className="h-56 w-full relative">
        <img
          src={book.coverImage}
          alt={`${book.title} book cover`}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-title font-bold text-lg text-primary-800">
              {book.title}
            </h3>
            <p className="text-muted-foreground text-sm">By {book.author}</p>
          </div>
          <div className="flex items-center bg-secondary-100 px-2 py-0.5 rounded-full">
            <StarIcon className="h-3 w-3 text-secondary-500 mr-1" />
            <span className="text-secondary-700 text-sm font-medium">
              {book.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <p className="text-primary-600 text-sm mt-2 line-clamp-2">
          {book.description}
        </p>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="font-bold text-primary-800">${book.price.toFixed(2)}</span>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
