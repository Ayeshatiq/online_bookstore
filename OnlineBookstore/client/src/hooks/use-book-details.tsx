import { createContext, useContext, useState, ReactNode } from "react";
import { Book } from "@shared/schema";

interface BookDetailsContextProps {
  isOpen: boolean;
  currentBook: Book | null;
  openBookDetails: (book: Book) => void;
  closeBookDetails: () => void;
}

const BookDetailsContext = createContext<BookDetailsContextProps | undefined>(undefined);

export function BookDetailsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  const openBookDetails = (book: Book) => {
    setCurrentBook(book);
    setIsOpen(true);
  };

  const closeBookDetails = () => {
    setIsOpen(false);
  };

  return (
    <BookDetailsContext.Provider
      value={{
        isOpen,
        currentBook,
        openBookDetails,
        closeBookDetails,
      }}
    >
      {children}
    </BookDetailsContext.Provider>
  );
}

export function useBookDetails() {
  const context = useContext(BookDetailsContext);
  if (context === undefined) {
    throw new Error("useBookDetails must be used within a BookDetailsProvider");
  }
  return context;
}
