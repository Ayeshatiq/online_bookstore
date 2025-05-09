import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  books, type Book, type InsertBook,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  subscribers, type Subscriber, type InsertSubscriber
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ne } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  incrementCategoryBookCount(id: number): Promise<void>;
  decrementCategoryBookCount(id: number): Promise<void>;
  
  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, bookData: Partial<Book>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  getRelatedBooks(categoryId: number, excludeId: number): Promise<Book[]>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByBookId(userId: number, bookId: number): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, itemData: Partial<CartItem>): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Subscriber operations
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private books: Map<number, Book>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private subscribers: Map<number, Subscriber>;
  
  private userId: number;
  private categoryId: number;
  private bookId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;
  private subscriberId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.books = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.subscribers = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.bookId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.subscriberId = 1;
    
    // Initialize with demo data
    this.initializeData();
  }

  private initializeData() {
    // Create categories
    const categories = [
      { name: "Fiction", icon: '<i class="ri-book-mark-line"></i>', bookCount: 0 },
      { name: "Non-Fiction", icon: '<i class="ri-article-line"></i>', bookCount: 0 },
      { name: "Sci-Fi", icon: '<i class="ri-rocket-line"></i>', bookCount: 0 },
      { name: "Mystery", icon: '<i class="ri-spy-line"></i>', bookCount: 0 },
      { name: "Biography", icon: '<i class="ri-user-star-line"></i>', bookCount: 0 },
      { name: "Children", icon: '<i class="ri-emotion-happy-line"></i>', bookCount: 0 }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Create books
    const books = [
      {
        title: "The Dragon's Revenge",
        author: "Emily Winters",
        description: "A thrilling fantasy adventure about a kingdom under siege and the unlikely hero who must save it. When ancient dragons return to the realm seeking revenge for past betrayals, young Aria discovers she possesses forgotten magic that may be the key to saving her people. But first, she must navigate treacherous politics, master her powers, and forge unlikely alliances before time runs out.",
        price: 24.99,
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        rating: 4.7,
        reviewCount: 124,
        pages: 342,
        publisher: "Mystic Press",
        publicationDate: "June 15, 2023",
        language: "English",
        isbn: "978-1234567890",
        categoryId: 1,
        inStock: true
      },
      {
        title: "Mindful Living",
        author: "Dr. Sarah Johnson",
        description: "Discover the secrets to a more balanced and fulfilling life through mindfulness practices. Dr. Sarah Johnson combines scientific research with practical techniques to help you reduce stress, improve focus, and cultivate greater happiness in everyday life.",
        price: 18.50,
        coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        rating: 4.9,
        reviewCount: 89,
        pages: 276,
        publisher: "Wellness Books",
        publicationDate: "March 22, 2023",
        language: "English",
        isbn: "978-9876543210",
        categoryId: 2,
        inStock: true
      },
      {
        title: "The Silent Witness",
        author: "James Patterson",
        description: "A gripping thriller about a detective tracking a serial killer who leaves no evidence behind. When the bodies start piling up and the only witness is a child who won't speak, Detective Alex Cross must race against time to prevent another murder.",
        price: 21.75,
        coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        rating: 4.6,
        reviewCount: 156,
        pages: 320,
        publisher: "Mystery House",
        publicationDate: "October 5, 2022",
        language: "English",
        isbn: "978-5678901234",
        categoryId: 4,
        inStock: true
      },
      {
        title: "Global Kitchen",
        author: "Chef Marco Lee",
        description: "100 delicious recipes from around the world, with simple instructions for cooks of all levels. From Italian pasta to Thai curries, this cookbook brings international flavors to your home kitchen.",
        price: 29.99,
        coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        rating: 4.8,
        reviewCount: 72,
        pages: 248,
        publisher: "Culinary Arts",
        publicationDate: "May 12, 2023",
        language: "English",
        isbn: "978-2345678901",
        categoryId: 2,
        inStock: true
      },
      {
        title: "Cosmos Explained",
        author: "Dr. Neil Adams",
        description: "An accessible journey through the mysteries of our universe, from quantum physics to black holes. Dr. Adams breaks down complex astronomical concepts into engaging explanations that anyone can understand.",
        price: 26.50,
        coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        rating: 4.5,
        reviewCount: 63,
        pages: 412,
        publisher: "Science Today",
        publicationDate: "January 18, 2023",
        language: "English",
        isbn: "978-3456789012",
        categoryId: 2,
        inStock: true
      },
      {
        title: "The Queen's Gambit",
        author: "Elizabeth Harris",
        description: "A captivating tale of political intrigue set in Tudor England during the reign of Queen Elizabeth I. When a young lady-in-waiting discovers a plot against the crown, she must use all her wit and courage to save the queen.",
        price: 22.95,
        coverImage: "https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_1280.jpg",
        rating: 4.7,
        reviewCount: 108,
        pages: 368,
        publisher: "Historical Press",
        publicationDate: "August 30, 2022",
        language: "English",
        isbn: "978-4567890123",
        categoryId: 1,
        inStock: true
      },
      {
        title: "Start-Up Mindset",
        author: "Mark Robertson",
        description: "Essential strategies for entrepreneurs looking to build successful businesses in today's digital economy. Robertson draws from his experience with multiple tech start-ups to provide practical advice for aspiring business owners.",
        price: 19.99,
        coverImage: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        rating: 4.6,
        reviewCount: 94,
        pages: 286,
        publisher: "Business Edge",
        publicationDate: "February 4, 2023",
        language: "English",
        isbn: "978-5678901234",
        categoryId: 2,
        inStock: true
      },
      {
        title: "The Magical Forest",
        author: "Lisa Wilson",
        description: "A beautifully illustrated children's book about friendship, courage, and the wonders of nature. Follow Max and Lily as they discover a magical forest behind their new home and the enchanted creatures that live there.",
        price: 16.99,
        coverImage: "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        rating: 4.9,
        reviewCount: 127,
        pages: 48,
        publisher: "Kids Wonder",
        publicationDate: "April 2, 2023",
        language: "English",
        isbn: "978-6789012345",
        categoryId: 6,
        inStock: true
      }
    ];
    
    books.forEach(book => {
      this.createBook(book);
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "$2a$10$RCoXteR2ilbjWrHKi7IghuP7E/fCvhWf82Wch7mM7Ta1mK/n.M61S", // "admin123"
      firstName: "Admin",
      lastName: "User",
      email: "admin@bookhaven.com",
      isAdmin: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async incrementCategoryBookCount(id: number): Promise<void> {
    const category = await this.getCategory(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    const updatedCategory = { ...category, bookCount: category.bookCount + 1 };
    this.categories.set(id, updatedCategory);
  }

  async decrementCategoryBookCount(id: number): Promise<void> {
    const category = await this.getCategory(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    const updatedCategory = { 
      ...category, 
      bookCount: Math.max(0, category.bookCount - 1) 
    };
    this.categories.set(id, updatedCategory);
  }

  // Book operations
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = this.bookId++;
    const newBook: Book = { 
      ...book, 
      id,
      createdAt: new Date()
    };
    this.books.set(id, newBook);
    return newBook;
  }

  async updateBook(id: number, bookData: Partial<Book>): Promise<Book> {
    const book = await this.getBook(id);
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    
    const updatedBook = { ...book, ...bookData };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<void> {
    const book = await this.getBook(id);
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    
    this.books.delete(id);
  }

  async getRelatedBooks(categoryId: number, excludeId: number): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.categoryId === categoryId && book.id !== excludeId)
      .slice(0, 4); // Limit to 4 related books
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async getCartItemByBookId(userId: number, bookId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.bookId === bookId,
    );
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemId++;
    const cartItem: CartItem = { 
      ...item, 
      id,
      createdAt: new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, itemData: Partial<CartItem>): Promise<CartItem> {
    const item = await this.getCartItem(id);
    if (!item) {
      throw new Error(`Cart item with ID ${id} not found`);
    }
    
    const updatedItem = { ...item, ...itemData };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    const item = await this.getCartItem(id);
    if (!item) {
      throw new Error(`Cart item with ID ${id} not found`);
    }
    
    this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<void> {
    const items = await this.getCartItems(userId);
    for (const item of items) {
      this.cartItems.delete(item.id);
    }
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id,
      createdAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const orderItem: OrderItem = { ...item, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }

  // Subscriber operations
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.subscriberId++;
    const newSubscriber: Subscriber = { 
      ...subscriber, 
      id,
      createdAt: new Date()
    };
    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async incrementCategoryBookCount(id: number): Promise<void> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    await db.update(categories)
      .set({ bookCount: category.bookCount + 1 })
      .where(eq(categories.id, id));
  }

  async decrementCategoryBookCount(id: number): Promise<void> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    await db.update(categories)
      .set({ bookCount: Math.max(0, category.bookCount - 1) })
      .where(eq(categories.id, id));
  }

  // Book operations
  async getAllBooks(): Promise<Book[]> {
    return await db.select().from(books);
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: number, bookData: Partial<Book>): Promise<Book> {
    const [book] = await db.update(books).set(bookData).where(eq(books.id, id)).returning();
    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }
    return book;
  }

  async deleteBook(id: number): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async getRelatedBooks(categoryId: number, excludeId: number): Promise<Book[]> {
    return await db.select()
      .from(books)
      .where(and(
        eq(books.categoryId, categoryId),
        ne(books.id, excludeId)
      ))
      .limit(4);
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db.select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    const [cartItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return cartItem;
  }

  async getCartItemByBookId(userId: number, bookId: number): Promise<CartItem | undefined> {
    const [cartItem] = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, userId),
        eq(cartItems.bookId, bookId)
      ));
    return cartItem;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db.insert(cartItems).values(item).returning();
    return cartItem;
  }

  async updateCartItem(id: number, itemData: Partial<CartItem>): Promise<CartItem> {
    const [cartItem] = await db.update(cartItems)
      .set(itemData)
      .where(eq(cartItems.id, id))
      .returning();
    
    if (!cartItem) {
      throw new Error(`Cart item with ID ${id} not found`);
    }
    
    return cartItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(item).returning();
    return orderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  // Subscriber operations
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select()
      .from(subscribers)
      .where(eq(subscribers.email, email));
    return subscriber;
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const [newSubscriber] = await db.insert(subscribers).values(subscriber).returning();
    return newSubscriber;
  }
}

// For initial setup, still use MemStorage to populate database with sample data
const memStorage = new MemStorage();

// For production use database storage
export const storage = new DatabaseStorage();
