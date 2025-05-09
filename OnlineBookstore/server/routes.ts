import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  registerSchema, 
  insertBookSchema,
  insertCategorySchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertSubscriberSchema
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Session types
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const authenticate = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    next();
  };

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Remove confirmPassword and terms from validated data
      const { confirmPassword, terms, ...userData } = validatedData;
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/auth/profile", authenticate, async (req, res) => {
    try {
      // Validate input
      const { firstName, lastName, email } = req.body;
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(req.session.userId!, {
        firstName,
        lastName,
        email
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch("/api/auth/password", authenticate, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get user
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(req.session.userId!, {
        password: hashedPassword
      });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });

  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Books routes
  app.get("/api/books", async (req, res) => {
    try {
      const { search, category, sort } = req.query;
      let books = await storage.getAllBooks();
      
      // Apply filters
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        books = books.filter(book => 
          book.title.toLowerCase().includes(searchTerm) || 
          book.author.toLowerCase().includes(searchTerm) ||
          book.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (category) {
        const categoryId = parseInt(category.toString());
        books = books.filter(book => book.categoryId === categoryId);
      }
      
      // Apply sorting
      if (sort) {
        switch (sort.toString()) {
          case 'latest':
            books.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'price-low':
            books.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            books.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            books.sort((a, b) => b.rating - a.rating);
            break;
          default: // 'popular' or any other value
            books.sort((a, b) => b.reviewCount - a.reviewCount);
        }
      } else {
        // Default sort by popularity
        books.sort((a, b) => b.reviewCount - a.reviewCount);
      }
      
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to get books" });
    }
  });

  app.get("/api/books/admin", isAdmin, async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to get books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to get book" });
    }
  });

  app.get("/api/books/related/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const relatedBooks = await storage.getRelatedBooks(book.categoryId, id);
      res.json(relatedBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get related books" });
    }
  });

  app.post("/api/books", isAdmin, async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedData);
      
      // Update category book count
      await storage.incrementCategoryBookCount(book.categoryId);
      
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.patch("/api/books/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const validatedData = insertBookSchema.parse(req.body);
      
      // Check if category changed
      if (book.categoryId !== validatedData.categoryId) {
        // Decrement old category count
        await storage.decrementCategoryBookCount(book.categoryId);
        
        // Increment new category count
        await storage.incrementCategoryBookCount(validatedData.categoryId);
      }
      
      const updatedBook = await storage.updateBook(id, validatedData);
      res.json(updatedBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      await storage.deleteBook(id);
      
      // Decrement category book count
      await storage.decrementCategoryBookCount(book.categoryId);
      
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Cart routes
  app.get("/api/cart", authenticate, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.session.userId!);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cart items" });
    }
  });

  app.post("/api/cart", authenticate, async (req, res) => {
    try {
      const { bookId, quantity } = req.body;
      
      // Validate input
      if (!bookId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if book exists
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Check if book is in stock
      if (!book.inStock) {
        return res.status(400).json({ message: "Book is out of stock" });
      }
      
      // Check if item is already in cart
      const existingItem = await storage.getCartItemByBookId(req.session.userId!, bookId);
      
      if (existingItem) {
        // Update quantity
        const updatedItem = await storage.updateCartItem(existingItem.id, {
          quantity: existingItem.quantity + (quantity || 1)
        });
        return res.json(updatedItem);
      }
      
      // Add to cart
      const cartItem = await storage.addToCart({
        userId: req.session.userId!,
        bookId,
        quantity: quantity || 1
      });
      
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:bookId", authenticate, async (req, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const { quantity } = req.body;
      
      // Validate input
      if (quantity === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if item is in cart
      const cartItem = await storage.getCartItemByBookId(req.session.userId!, bookId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      
      // Update quantity
      const updatedItem = await storage.updateCartItem(cartItem.id, { quantity });
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:bookId", authenticate, async (req, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      
      // Check if item is in cart
      const cartItem = await storage.getCartItemByBookId(req.session.userId!, bookId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      
      // Remove from cart
      await storage.removeFromCart(cartItem.id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", authenticate, async (req, res) => {
    try {
      await storage.clearCart(req.session.userId!);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Checkout route
  app.post("/api/checkout", authenticate, async (req, res) => {
    try {
      const { shippingAddress, paymentMethod } = req.body;
      
      // Validate input
      if (!shippingAddress || !paymentMethod) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(req.session.userId!);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total amount
      let totalAmount = 0;
      
      for (const item of cartItems) {
        const book = await storage.getBook(item.bookId);
        
        if (!book) {
          return res.status(404).json({ message: `Book with ID ${item.bookId} not found` });
        }
        
        if (!book.inStock) {
          return res.status(400).json({ message: `${book.title} is out of stock` });
        }
        
        totalAmount += book.price * item.quantity;
      }
      
      // Add shipping if total is less than $35
      if (totalAmount < 35) {
        totalAmount += 5.99;
      }
      
      // Create order
      const order = await storage.createOrder({
        userId: req.session.userId!,
        totalAmount,
        status: "pending",
        shippingAddress,
        paymentMethod
      });
      
      // Create order items
      for (const item of cartItems) {
        const book = await storage.getBook(item.bookId);
        
        await storage.createOrderItem({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          price: book!.price
        });
      }
      
      // Clear cart
      await storage.clearCart(req.session.userId!);
      
      res.status(201).json({ orderId: order.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to checkout" });
    }
  });

  // Orders routes
  app.get("/api/orders", authenticate, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.session.userId!);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.get("/api/orders/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order belongs to user or user is admin
      const user = await storage.getUser(req.session.userId!);
      
      if (order.userId !== req.session.userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(id);
      
      // Get books
      const orderItemsWithBooks = await Promise.all(
        orderItems.map(async (item) => {
          const book = await storage.getBook(item.bookId);
          return { ...item, book };
        })
      );
      
      res.json({ ...order, items: orderItemsWithBooks });
    } catch (error) {
      res.status(500).json({ message: "Failed to get order" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      
      // Check if email already subscribed
      const existingSubscriber = await storage.getSubscriberByEmail(validatedData.email);
      
      if (existingSubscriber) {
        return res.status(400).json({ message: "Email already subscribed" });
      }
      
      const subscriber = await storage.createSubscriber(validatedData);
      res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
