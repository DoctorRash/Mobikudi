import { useState } from "react";
import BudgetCard from "@/components/BudgetCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingDown, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Budget = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock data - will be replaced with real data
  const [budgets, setBudgets] = useState([
    { id: "1", category: "Food", spent: 35000, limit: 40000, icon: "🍔" },
    { id: "2", category: "Transport", spent: 28000, limit: 25000, icon: "🚗" },
    { id: "3", category: "Entertainment", spent: 15000, limit: 20000, icon: "🎬" },
    { id: "4", category: "Bills", spent: 42000, limit: 50000, icon: "💡" },
    { id: "5", category: "Shopping", spent: 18000, limit: 30000, icon: "🛍️" },
  ]);

  const categories = [
    { name: "Food", icon: "🍔" },
    { name: "Transport", icon: "🚗" },
    { name: "Entertainment", icon: "🎬" },
    { name: "Bills", icon: "💡" },
    { name: "Shopping", icon: "🛍️" },
    { name: "Health", icon: "⚕️" },
    { name: "Others", icon: "💰" },
  ];

  const handleAddBudget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get("category") as string;
    const categoryData = categories.find(c => c.name === category);
    
    const newBudget = {
      id: Date.now().toString(),
      category,
      spent: 0,
      limit: Number(formData.get("limit")),
      icon: categoryData?.icon || "💰",
    };
    
    setBudgets([...budgets, newBudget]);
    setIsAddDialogOpen(false);
    toast({
      title: "Budget created",
      description: `Budget for ${category} has been set successfully.`,
    });
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgets.filter(b => b.spent > b.limit).length;

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Budget Management</h1>
          <p className="text-muted-foreground">Set limits and track your spending</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limit">Monthly Limit (₦)</Label>
                <Input 
                  id="limit" 
                  name="limit" 
                  type="number" 
                  placeholder="50000" 
                  required 
                  min="1000"
                />
              </div>
              <Button type="submit" className="w-full">Create Budget</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <TrendingDown className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">₦{totalBudget.toLocaleString()}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <TrendingDown className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">₦{totalSpent.toLocaleString()}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Over Budget</p>
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{overBudgetCount}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {overBudgetCount > 0 ? "Categories need attention" : "All within limits"}
          </p>
        </Card>
      </div>

      {/* AI Tip */}
      {overBudgetCount > 0 && (
        <Card className="p-4 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Budget Alert</h4>
              <p className="text-sm text-muted-foreground">
                You're over budget in {overBudgetCount} {overBudgetCount === 1 ? "category" : "categories"}. 
                Try to reduce spending or adjust your limits.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Budget Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => (
          <BudgetCard key={budget.id} {...budget} />
        ))}
      </div>

      {budgets.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No budgets created yet</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Budget
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Budget;
