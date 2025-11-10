import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  category: string;
  spent: number;
  limit: number;
  icon?: string;
}

const BudgetCard = ({ category, spent, limit, icon = "💰" }: BudgetCardProps) => {
  const percentage = (spent / limit) * 100;
  const isWarning = percentage >= 80;
  const isOverBudget = percentage >= 100;

  return (
    <Card className="p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-semibold text-foreground">{category}</h4>
            <p className="text-xs text-muted-foreground">
              ₦{spent.toLocaleString()} of ₦{limit.toLocaleString()}
            </p>
          </div>
        </div>
        <span className={cn(
          "text-sm font-bold",
          isOverBudget ? "text-destructive" : isWarning ? "text-warning" : "text-success"
        )}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className={cn(
          "h-2",
          isOverBudget ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-warning" : "[&>div]:bg-success"
        )}
      />
      {isOverBudget && (
        <p className="text-xs text-destructive mt-2 font-medium">
          ⚠️ Over budget by ₦{(spent - limit).toLocaleString()}
        </p>
      )}
      {isWarning && !isOverBudget && (
        <p className="text-xs text-warning mt-2 font-medium">
          ⚠️ Approaching limit
        </p>
      )}
    </Card>
  );
};

export default BudgetCard;
