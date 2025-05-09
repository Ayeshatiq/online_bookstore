import { db, pool } from './db';
import { 
  users, 
  categories, 
  books,
  subscribers
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Check if database tables already have data
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log('Database already has data, skipping seeding');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(users).values({
    username: "admin",
    password: hashedPassword,
    firstName: "Admin",
    lastName: "User",
    email: "admin@bookhaven.com",
    isAdmin: true
  });
  console.log('Created admin user');

  // Create categories
  const categoriesData = [
    { name: "Fiction", icon: '<i class="ri-book-mark-line"></i>', bookCount: 0 },
    { name: "Non-Fiction", icon: '<i class="ri-article-line"></i>', bookCount: 0 },
    { name: "Sci-Fi", icon: '<i class="ri-rocket-line"></i>', bookCount: 0 },
    { name: "Mystery", icon: '<i class="ri-spy-line"></i>', bookCount: 0 },
    { name: "Biography", icon: '<i class="ri-user-star-line"></i>', bookCount: 0 },
    { name: "Children", icon: '<i class="ri-emotion-happy-line"></i>', bookCount: 0 }
  ];

  const insertedCategories = await db.insert(categories).values(categoriesData).returning();
  console.log(`Created ${insertedCategories.length} categories`);

  // Create books
  const booksData = [
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
      categoryId: insertedCategories[0].id,
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
      categoryId: insertedCategories[1].id,
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
      categoryId: insertedCategories[3].id,
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
      categoryId: insertedCategories[1].id,
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
      categoryId: insertedCategories[1].id,
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
      categoryId: insertedCategories[0].id,
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
      categoryId: insertedCategories[1].id,
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
      categoryId: insertedCategories[5].id,
      inStock: true
    }
  ];

  const insertedBooks = await db.insert(books).values(booksData).returning();
  console.log(`Created ${insertedBooks.length} books`);

  // Update category book counts
  for (const book of insertedBooks) {
    const category = await db.select().from(categories).where(eq(categories.id, book.categoryId));
    if (category.length > 0) {
      await db.update(categories)
        .set({ bookCount: category[0].bookCount + 1 })
        .where(eq(categories.id, book.categoryId));
    }
  }
  console.log('Updated category book counts');

  console.log('✅ Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Disconnecting from database');
    await pool.end();
    process.exit(0);
  });