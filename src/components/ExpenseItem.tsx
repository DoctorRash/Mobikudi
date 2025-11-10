import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface ExpenseItemProps {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ExpenseItem = ({ id, category, amount, description, date, onEdit, onDelete }: ExpenseItemProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-100 text-orange-700 border-orange-200",
      Transport: "bg-blue-100 text-blue-700 border-blue-200",
      Entertainment: "bg-purple-100 text-purple-700 border-purple-200",
      Bills: "bg-red-100 text-red-700 border-red-200",
      Shopping: "bg-pink-100 text-pink-700 border-pink-200",
      Health: "bg-green-100 text-green-700 border-green-200",
      Others: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[category] || colors.Others;
  };

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(category)}`}>
              {category}
            </span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <p className="text-sm text-foreground font-medium truncate">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-foreground whitespace-nowrap">
            ₦{amount.toLocaleString()}
          </span>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => onEdit(id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseItem;
