import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from "@/components/layouts/MainLayout";
import { Book, Category, insertBookSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircleIcon, EditIcon, TrashIcon, ChevronDownIcon } from "@/lib/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type BookFormValues = Omit<Book, 'id' | 'createdAt'>;

export default function AdminBooks() {
  const { user, isAuthenticated } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // If not authenticated or not admin, redirect to home
  if (!isAuthenticated || !user?.isAdmin) {
    navigate("/");
    return null;
  }

  // Fetch books
  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ['/api/books/admin'],
  });

  // Fetch categories for the form select input
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Form setup
  const form = useForm<BookFormValues>({
    resolver: zodResolver(insertBookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      price: 0,
      coverImage: "",
      pages: 0,
      publisher: "",
      publicationDate: "",
      language: "English",
      isbn: "",
      categoryId: 1,
      inStock: true,
      rating: 0,
      reviewCount: 0,
    },
  });

  // Create a new book
  const createBookMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      return await apiRequest("POST", "/api/books", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books/admin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      setIsDialogOpen(false);
      toast({
        title: "Book created",
        description: "The book has been added successfully.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create book",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing book
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BookFormValues }) => {
      return await apiRequest("PATCH", `/api/books/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books/admin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      setIsDialogOpen(false);
      setEditingBook(null);
      toast({
        title: "Book updated",
        description: "The book has been updated successfully.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update book",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a book
  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/books/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books/admin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      setIsDeleteDialogOpen(false);
      setBookToDelete(null);
      toast({
        title: "Book deleted",
        description: "The book has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete book",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: BookFormValues) => {
    if (editingBook) {
      updateBookMutation.mutate({ id: editingBook.id, data });
    } else {
      createBookMutation.mutate(data);
    }
  };

  // Handle opening the edit dialog
  const handleEdit = (book: Book) => {
    setEditingBook(book);
    
    // Set form values
    form.reset({
      ...book,
      price: book.price, // Ensure the price is a number
      pages: book.pages, // Ensure pages is a number
      categoryId: book.categoryId, // Ensure categoryId is a number
    });
    
    setIsDialogOpen(true);
  };

  // Handle opening the create dialog
  const handleCreate = () => {
    setEditingBook(null);
    form.reset({
      title: "",
      author: "",
      description: "",
      price: 0,
      coverImage: "",
      pages: 0,
      publisher: "",
      publicationDate: "",
      language: "English",
      isbn: "",
      categoryId: categories ? categories[0]?.id : 1,
      inStock: true,
      rating: 0,
      reviewCount: 0,
    });
    setIsDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (bookToDelete) {
      deleteBookMutation.mutate(bookToDelete.id);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Manage Books | BookHaven Admin</title>
        <meta name="description" content="Admin panel for managing books in the BookHaven store." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-title font-bold text-primary-800">
            Manage Books
          </h1>
          <Button onClick={handleCreate}>
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Add New Book
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Book Inventory</CardTitle>
            <CardDescription>Manage your store's book catalog</CardDescription>
          </CardHeader>
          <CardContent>
            {booksLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : books && books.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{getCategoryName(book.categoryId)}</TableCell>
                        <TableCell>${book.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            book.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {book.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </TableCell>
                        <TableCell>{book.rating.toFixed(1)} ({book.reviewCount})</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(book)}>
                                <EditIcon className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setBookToDelete(book);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No books available</h3>
                <p className="text-muted-foreground mb-6">
                  Your book catalog is empty. Start adding books to your inventory.
                </p>
                <Button onClick={handleCreate}>Add Your First Book</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Book Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
              <DialogDescription>
                {editingBook 
                  ? "Update the details of the existing book." 
                  : "Fill in the details to add a new book to the catalog."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pages</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="inStock"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel htmlFor="inStock">In Stock</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="coverImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isbn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ISBN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="publisher"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publisher</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="publicationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publication Date</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createBookMutation.isPending || updateBookMutation.isPending}
                  >
                    {editingBook ? "Update Book" : "Add Book"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Book</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteBookMutation.isPending}
              >
                {deleteBookMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
