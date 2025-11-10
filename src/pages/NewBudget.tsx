import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import BudgetCard from "@/components/BudgetCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const NewBudget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [category, setCategory] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [icon, setIcon] = useState('💰');

  useEffect(() => {
    if (user) {
      fetchBudgets();
      fetchTransactions();
    }
  }, [user]);

  const fetchBudgets = async () => {
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user?.id);
    
    if (data) setBudgets(data);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('type', 'expense');
    
    if (data) setTransactions(data);
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: user?.id,
        category,
        limit_amount: parseFloat(limitAmount),
        icon
      });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Budget added successfully',
      });
      setDialogOpen(false);
      setCategory('');
      setLimitAmount('');
      setIcon('💰');
      fetchBudgets();
    }
  };

  const getSpentForCategory = (cat: string) => {
    return transactions
      .filter(t => t.category.toLowerCase() === cat.toLowerCase())
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Budget</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Budget Limit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Limit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Food, Transport"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Limit (₦)</Label>
                <Input
                  type="number"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="50000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="💰"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.length > 0 ? (
          budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              category={budget.category}
              spent={getSpentForCategory(budget.category)}
              limit={Number(budget.limit_amount)}
              icon={budget.icon}
            />
          ))
        ) : (
          <Card className="col-span-full p-8 text-center text-muted-foreground">
            <p>No budgets set. Create your first budget limit!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewBudget;
