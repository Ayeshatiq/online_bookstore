import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import { Book } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { 
  StarIcon, 
  HeartIcon, 
  BookOpenIcon, 
  ShoppingCartIcon, 
  ChevronLeftIcon 
} from "@/lib/icons";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet";

export default function BookDetails() {
  const params = useParams<{ id: string }>();
  const bookId = parseInt(params.id);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const { data: book, isLoading, error } = useQuery<Book>({
    queryKey: [`/api/books/${bookId}`],
  });

  const { data: relatedBooks, isLoading: relatedLoading } = useQuery<Book[]>({
    queryKey: ['/api/books/related', bookId],
    enabled: !!book,
  });

  // Handle invalid book ID
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Book not found or has been removed.",
        variant: "destructive",
      });
      navigate("/books");
    }
  }, [error, navigate, toast]);

  const handleAddToCart = () => {
    if (book) {
      addToCart(book);
      toast({
        title: "Added to cart",
        description: `${book.title} has been added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 w-1/4 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-[500px] rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
                <div className="h-32 bg-gray-200 rounded mt-6"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded-md mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!book) return null;

  // Generate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`full-${i}`} className="h-5 w-5 text-secondary-500" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-5 w-5 text-secondary-500" />);
    }

    // Add empty stars
    for (let i = 0; i < 5 - fullStars - (hasHalfStar ? 1 : 0); i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  return (
    <MainLayout>
      <Helmet>
        <title>{book.title} | BookHaven</title>
        <meta name="description" content={book.description.substring(0, 160)} />
        <meta property="og:title" content={`${book.title} | BookHaven`} />
        <meta property="og:description" content={book.description.substring(0, 160)} />
        <meta property="og:image" content={book.coverImage} />
        <meta property="og:type" content="product" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 text-primary-600"
          onClick={() => navigate("/books")}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Back to Books
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="max-w-md mx-auto md:mx-0">
            <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md">
              <img
                src={book.coverImage}
                alt={`${book.title} book cover`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 bg-primary-50 rounded-lg p-3 flex items-center justify-center">
              <div className="flex items-center mr-3">
                <div className="flex">
                  {renderStars(book.rating)}
                </div>
                <span className="text-primary-800 font-medium ml-2">
                  {book.rating.toFixed(1)}
                </span>
                <span className="text-primary-500 text-sm ml-1">
                  ({book.reviewCount} reviews)
                </span>
              </div>
              <div className="h-5 w-px bg-primary-200 mx-2"></div>
              <div className="text-primary-600 text-sm flex items-center">
                <BookOpenIcon className="h-4 w-4 mr-1" />
                <span>{book.pages} pages</span>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-title font-bold text-primary-800 mb-2">
              {book.title}
            </h1>
            <p className="text-primary-600 mb-4">By {book.author}</p>

            <div className="text-xl font-title font-bold text-primary-900 mb-3">
              ${book.price.toFixed(2)}
            </div>
            
            <div className="mb-2 flex items-center">
              <span className={`text-sm px-2 py-0.5 rounded-full ${book.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {book.inStock ? "In Stock" : "Out of Stock"}
              </span>
              {book.inStock && (
                <span className="text-xs text-primary-500 ml-2">
                  Ships within 1-2 business days
                </span>
              )}
            </div>

            <Separator className="my-6" />

            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-primary-700">{book.description}</p>
              </TabsContent>
              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-primary-500 font-medium">Publisher:</span>
                    <span className="text-primary-800 ml-1">{book.publisher}</span>
                  </div>
                  <div>
                    <span className="text-primary-500 font-medium">Publication Date:</span>
                    <span className="text-primary-800 ml-1">{book.publicationDate}</span>
                  </div>
                  <div>
                    <span className="text-primary-500 font-medium">Language:</span>
                    <span className="text-primary-800 ml-1">{book.language}</span>
                  </div>
                  <div>
                    <span className="text-primary-500 font-medium">ISBN:</span>
                    <span className="text-primary-800 ml-1">{book.isbn}</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 mt-8">
              <Button
                className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white"
                onClick={handleAddToCart}
                disabled={!book.inStock}
              >
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                {book.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button variant="outline" size="icon" className="border border-primary-300 hover:border-primary-400 bg-white hover:bg-primary-50 text-primary-700">
                <HeartIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {!relatedLoading && relatedBooks && relatedBooks.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-title font-bold text-primary-800 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.slice(0, 4).map(relatedBook => (
                <div 
                  key={relatedBook.id} 
                  className="cursor-pointer"
                  onClick={() => navigate(`/books/${relatedBook.id}`)}
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-sm">
                    <img
                      src={relatedBook.coverImage}
                      alt={`${relatedBook.title} book cover`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium mt-2 text-primary-800 line-clamp-1">
                    {relatedBook.title}
                  </h3>
                  <p className="text-sm text-primary-600">${relatedBook.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
