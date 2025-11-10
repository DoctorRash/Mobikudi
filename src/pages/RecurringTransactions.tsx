import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Calendar, Repeat } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  frequency: string;
  start_date: string;
  end_date?: string;
  next_occurrence: string;
  is_active: boolean;
  note?: string;
}

const RecurringTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
    frequency: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    note: "",
    is_active: true,
  });

  const categories = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment",
    "Bills & Utilities", "Healthcare", "Education", "Travel",
    "Subscriptions", "Rent/Mortgage", "Insurance", "Salary", "Other"
  ];

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  useEffect(() => {
    if (user) {
      fetchRecurringTransactions();
    }
  }, [user]);

  const fetchRecurringTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as RecurringTransaction[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextOccurrence = (startDate: string, frequency: string): string => {
    const date = new Date(startDate);
    const today = new Date();
    
    while (date < today) {
      switch (frequency) {
        case "daily":
          date.setDate(date.getDate() + 1);
          break;
        case "weekly":
          date.setDate(date.getDate() + 7);
          break;
        case "monthly":
          date.setMonth(date.getMonth() + 1);
          break;
        case "yearly":
          date.setFullYear(date.getFullYear() + 1);
          break;
      }
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nextOccurrence = calculateNextOccurrence(formData.start_date, formData.frequency);
    
    const dataToSubmit = {
      user_id: user?.id,
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      frequency: formData.frequency,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      next_occurrence: nextOccurrence,
      is_active: formData.is_active,
      note: formData.note || null,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("recurring_transactions")
          .update(dataToSubmit)
          .eq("id", editingId);
        
        if (error) throw error;
        toast({ title: "Recurring transaction updated successfully" });
      } else {
        const { error } = await supabase
          .from("recurring_transactions")
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast({ title: "Recurring transaction created successfully" });
      }
      
      resetForm();
      setIsDialogOpen(false);
      fetchRecurringTransactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingId(transaction.id);
    setFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
      frequency: transaction.frequency,
      start_date: transaction.start_date,
      end_date: transaction.end_date || "",
      note: transaction.note || "",
      is_active: transaction.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Recurring transaction deleted" });
      fetchRecurringTransactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("recurring_transactions")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: `Recurring transaction ${!currentStatus ? "activated" : "paused"}` });
      fetchRecurringTransactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      category: "",
      type: "expense",
      frequency: "monthly",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      note: "",
      is_active: true,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recurring Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your regular bills, subscriptions, and income</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Add"} Recurring Transaction</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Netflix Subscription"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Add any additional details..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <Repeat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Recurring Transactions</h3>
          <p className="text-muted-foreground mb-4">Set up automatic tracking for bills, subscriptions, and regular income</p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Recurring Transaction
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className={`p-4 ${!transaction.is_active ? "opacity-60" : ""}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{transaction.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{transaction.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}₦{transaction.amount.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Frequency</span>
                  <span className="text-sm capitalize">{transaction.frequency}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Next Occurrence</span>
                  <span className="text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(transaction.next_occurrence).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {transaction.note && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{transaction.note}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-muted-foreground">
                  {transaction.is_active ? "Active" : "Paused"}
                </span>
                <Switch
                  checked={transaction.is_active}
                  onCheckedChange={() => toggleActive(transaction.id, transaction.is_active)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;