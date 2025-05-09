import { Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [_, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/books?category=${category.id}`);
  };

  return (
    <Card 
      className="category-card bg-primary-50 rounded-lg p-4 text-center hover:bg-primary-100 transition-colors cursor-pointer" 
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
          <div className="text-2xl text-primary-700" dangerouslySetInnerHTML={{ __html: category.icon }} />
        </div>
        <h3 className="font-medium text-primary-800">{category.name}</h3>
        <p className="text-xs text-primary-500 mt-1">{category.bookCount} books</p>
      </CardContent>
    </Card>
  );
}
