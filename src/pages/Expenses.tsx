import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";
import ExpenseItem from "@/components/ExpenseItem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Expenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('transaction_date', { ascending: false });

    if (data) {
      setTransactions(data);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user?.id,
        type,
        category,
        amount: parseFloat(amount),
        note,
        transaction_date: new Date().toISOString().split('T')[0]
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
      setDialogOpen(false);
      setType('expense');
      setCategory('');
      setAmount('');
      setNote('');
      fetchTransactions();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Transaction deleted',
      });
      fetchTransactions();
    }
  };

  const filteredTransactions = transactions.filter(txn =>
    txn.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Food, Transport, Salary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (₦)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add details..."
                />
              </div>
              <Button type="submit" className="w-full">
                Add Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 bg-gradient-to-r from-secondary/10 to-primary/10">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
          <h2 className="text-3xl font-bold text-foreground">₦{totalExpenses.toLocaleString()}</h2>
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((txn) => (
            <ExpenseItem
              key={txn.id}
              id={txn.id}
              description={txn.note || txn.category}
              category={txn.category}
              amount={Number(txn.amount)}
              date={new Date(txn.transaction_date).toLocaleDateString()}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No transactions found. Add your first one!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Expenses;
