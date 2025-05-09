import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import { BookCard } from "@/components/ui/card-book";
import { CategoryCard } from "@/components/ui/card-category";
import { Book, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon, FilterIcon } from "@/lib/icons";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

export default function Books() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  
  const [searchTerm, setSearchTerm] = useState(params.get("search") || "");
  const [categoryId, setCategoryId] = useState<number | null>(
    params.get("category") ? parseInt(params.get("category")!) : null
  );
  const [view, setView] = useState(params.get("view") || "books");
  const [sortBy, setSortBy] = useState(params.get("sort") || "popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch books with filters
  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: [
      '/api/books', 
      searchTerm, 
      categoryId, 
      sortBy, 
      priceRange, 
      selectedRatings
    ],
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const updateQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (categoryId) params.set("category", categoryId.toString());
    if (sortBy !== "popular") params.set("sort", sortBy);
    if (view !== "books") params.set("view", view);
    
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  // Update URL when filters change
  useEffect(() => {
    updateQueryParams();
  }, [searchTerm, categoryId, sortBy, view]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams();
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating) 
        : [...prev, rating]
    );
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Browse Books | BookHaven</title>
        <meta name="description" content="Browse our extensive collection of books by category, rating, or price. Find your next favorite read at BookHaven." />
      </Helmet>

      <div className="bg-gray-50 py-6 mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-title font-bold text-primary-800 mb-4">
            Browse Our Books
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filters toggle */}
          <div className="lg:hidden mb-4">
            <Button 
              variant="outline" 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="w-full flex justify-between items-center"
            >
              <span>Filters</span>
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sidebar filters */}
          <div className={`lg:w-1/4 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="font-title font-bold text-xl mb-4">Filters</h2>
              
              {/* Category filter */}
              <div className="mb-6">
                <h3 className="font-medium text-primary-800 mb-2">Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="all-categories" 
                      checked={!categoryId}
                      onCheckedChange={() => setCategoryId(null)}
                    />
                    <Label htmlFor="all-categories" className="ml-2 text-sm font-normal cursor-pointer">
                      All Categories
                    </Label>
                  </div>
                  {categories?.map(category => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox 
                        id={`category-${category.id}`}
                        checked={categoryId === category.id}
                        onCheckedChange={() => setCategoryId(category.id)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="ml-2 text-sm font-normal cursor-pointer">
                        {category.name} ({category.bookCount})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Price range filter */}
              <div className="mb-6">
                <h3 className="font-medium text-primary-800 mb-2">Price Range</h3>
                <Slider
                  defaultValue={[0, 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="my-6"
                />
                <div className="flex justify-between">
                  <span className="text-sm">${priceRange[0]}</span>
                  <span className="text-sm">${priceRange[1]}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Rating filter */}
              <div className="mb-6">
                <h3 className="font-medium text-primary-800 mb-2">Rating</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center">
                      <Checkbox 
                        id={`rating-${rating}`} 
                        checked={selectedRatings.includes(rating)}
                        onCheckedChange={() => toggleRating(rating)}
                      />
                      <Label htmlFor={`rating-${rating}`} className="ml-2 text-sm font-normal cursor-pointer flex items-center">
                        {Array(rating).fill(0).map((_, i) => (
                          <span key={i} className="text-secondary-500">★</span>
                        ))}
                        {Array(5 - rating).fill(0).map((_, i) => (
                          <span key={i} className="text-gray-300">★</span>
                        ))}
                        <span className="ml-1">& Up</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button className="w-full" onClick={() => {
                setCategoryId(null);
                setPriceRange([0, 100]);
                setSelectedRatings([]);
                setSearchTerm("");
              }}>Clear All Filters</Button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <Tabs defaultValue={view} onValueChange={setView} className="w-full">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="books">Books</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center">
                    <label htmlFor="sort-by" className="text-sm text-primary-600 mr-2">
                      Sort by:
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
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
                
                <TabsContent value="books" className="mt-6">
                  {booksLoading ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 rounded-lg h-96"></div>
                        </div>
                      ))}
                    </div>
                  ) : books && books.length > 0 ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {books.map(book => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-medium text-primary-800 mb-2">No books found</h3>
                      <p className="text-primary-600">Try adjusting your filters or search terms.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="categories" className="mt-6">
                  {categoriesLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 rounded-lg h-40"></div>
                        </div>
                      ))}
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {categories.map(category => (
                        <CategoryCard key={category.id} category={category} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-medium text-primary-800 mb-2">No categories found</h3>
                      <p className="text-primary-600">Please try again later.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
