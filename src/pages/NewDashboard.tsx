import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Wallet, Target, LogOut } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const NewDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTransactions();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    setProfile(data);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('transaction_date', { ascending: false })
      .limit(5);

    if (data) {
      setTransactions(data);
      calculateStats(data);
      prepareChartData(data);
    }
  };

  const calculateStats = (txns: any[]) => {
    const income = txns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = txns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    setStats({
      income,
      expenses,
      balance: income - expenses
    });
  };

  const prepareChartData = async (txns: any[]) => {
    const last6Months = [...Array(6)].map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        monthNum: date.getMonth()
      };
    });

    // Fetch all transactions for the last 6 months
    const { data: allTxns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .gte('transaction_date', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0]);

    const data = last6Months.map(({ month, year, monthNum }) => {
      const monthTxns = (allTxns || []).filter(txn => {
        const txnDate = new Date(txn.transaction_date);
        return txnDate.getMonth() === monthNum && txnDate.getFullYear() === year;
      });

      const income = monthTxns
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = monthTxns
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { month, income, expenses };
    });

    setChartData(data);
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

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hello {firstName} 👋</h1>
            <p className="text-primary-foreground/80 text-sm">{new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/20">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardCard
            title="Balance"
            value={`₦${stats.balance.toLocaleString()}`}
            icon={<Wallet className="h-6 w-6" />}
          />
          <DashboardCard
            title="Total Income"
            value={`₦${stats.income.toLocaleString()}`}
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: '+12%', isPositive: true }}
          />
          <DashboardCard
            title="Total Expenses"
            value={`₦${stats.expenses.toLocaleString()}`}
            icon={<TrendingDown className="h-6 w-6" />}
            trend={{ value: '+8%', isPositive: false }}
          />
        </div>

        {/* AI Insight */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Insight
          </h3>
          <p className="text-sm text-foreground/80 mb-3">
            You're doing great! Consider saving ₦5,000 this week to reach your goal faster.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
            Chat with AI
          </Button>
        </Card>

        {/* Chart */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="hsl(var(--primary))" />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent Transactions</h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
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
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((txn) => (
                <div key={txn.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{txn.category}</p>
                    <p className="text-sm text-muted-foreground">{new Date(txn.transaction_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-semibold ${txn.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {txn.type === 'income' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions yet. Add your first one!</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NewDashboard;
