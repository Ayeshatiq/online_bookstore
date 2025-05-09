import { useBookDetails } from "@/hooks/use-book-details";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { HeartIcon, BookOpenIcon, CloseIcon, StarIcon } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

export default function BookDetailsModal() {
  const { isOpen, currentBook, closeBookDetails } = useBookDetails();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (currentBook) {
      addToCart(currentBook);
      toast({
        title: "Added to cart",
        description: `${currentBook.title} has been added to your cart.`,
      });
      closeBookDetails();
    }
  };

  if (!isOpen || !currentBook) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={closeBookDetails}
        ></div>
        <div className="relative bg-white rounded-lg max-w-3xl w-full shadow-xl z-10">
          <div className="absolute top-4 right-4">
            <button
              className="bg-white rounded-full p-1 text-primary-400 hover:text-primary-600 shadow-sm"
              onClick={closeBookDetails}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-6 flex flex-col">
              <img
                src={currentBook.coverImage}
                alt={`${currentBook.title} book cover`}
                className="w-full h-auto rounded-lg shadow-md"
              />
              <div className="mt-4 bg-primary-50 rounded-lg p-3 flex items-center justify-center">
                <div className="flex items-center mr-3">
                  <StarIcon className="h-4 w-4 text-secondary-500 mr-1" />
                  <span className="text-primary-800 font-medium">
                    {currentBook.rating.toFixed(1)}
                  </span>
                  <span className="text-primary-500 text-sm ml-1">
                    ({currentBook.reviewCount} reviews)
                  </span>
                </div>
                <div className="h-5 w-px bg-primary-200 mx-2"></div>
                <div className="text-primary-600 text-sm flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-1" />
                  <span>{currentBook.pages} pages</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-primary-50 md:rounded-tr-lg md:rounded-br-lg">
              <div className="mb-5">
                <h2 className="font-title font-bold text-2xl text-primary-800">
                  {currentBook.title}
                </h2>
                <p className="text-primary-600 mt-1">By {currentBook.author}</p>
              </div>
              <div className="mb-4">
                <div className="text-lg font-title font-bold text-primary-900 mb-1">
                  ${currentBook.price.toFixed(2)}
                </div>
                <div className="flex items-center">
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    {currentBook.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                  <span className="text-xs text-primary-500 ml-2">
                    Ships within 1-2 business days
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium text-primary-800 mb-2">Description</h3>
                <p className="text-primary-600 text-sm">{currentBook.description}</p>
              </div>
              <div className="mb-6">
                <h3 className="font-medium text-primary-800 mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-primary-500">Publisher:</span>
                    <span className="text-primary-800 ml-1">{currentBook.publisher}</span>
                  </div>
                  <div>
                    <span className="text-primary-500">Publication Date:</span>
                    <span className="text-primary-800 ml-1">{currentBook.publicationDate}</span>
                  </div>
                  <div>
                    <span className="text-primary-500">Language:</span>
                    <span className="text-primary-800 ml-1">{currentBook.language}</span>
                  </div>
                  <div>
                    <span className="text-primary-500">ISBN:</span>
                    <span className="text-primary-800 ml-1">{currentBook.isbn}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white"
                  onClick={handleAddToCart}
                  disabled={!currentBook.inStock}
                >
                  {currentBook.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button variant="outline" size="icon" className="border border-primary-300 hover:border-primary-400 bg-white hover:bg-primary-50 text-primary-700">
                  <HeartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
