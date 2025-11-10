import DashboardCard from "@/components/DashboardCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  DollarSign,
  Plus,
  Sparkles 
} from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  // Mock data - will be replaced with real data
  const monthlyData = [
    { month: "Jan", income: 150000, expenses: 120000 },
    { month: "Feb", income: 150000, expenses: 135000 },
    { month: "Mar", income: 150000, expenses: 125000 },
    { month: "Apr", income: 150000, expenses: 140000 },
  ];

  const recentTransactions = [
    { id: 1, category: "Food", amount: 5000, description: "Lunch at Chicken Republic", date: "Today" },
    { id: 2, category: "Transport", amount: 3000, description: "Uber to office", date: "Today" },
    { id: 3, category: "Bills", amount: 15000, description: "Electricity bill", date: "Yesterday" },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Welcome back, Kunle! 👋</h1>
          <p className="text-muted-foreground">Here's your financial overview for April</p>
        </div>
        <Link to="/expenses">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Balance"
          value="₦25,000"
          icon={<Wallet className="w-6 h-6" />}
          trend={{ value: "+12.5%", isPositive: true }}
        />
        <DashboardCard
          title="Monthly Income"
          value="₦150,000"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <DashboardCard
          title="Total Expenses"
          value="₦125,000"
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: "+8.2%", isPositive: false }}
        />
        <DashboardCard
          title="Savings Goal"
          value="68%"
          icon={<Target className="w-6 h-6" />}
          trend={{ value: "+5%", isPositive: true }}
        />
      </div>

      {/* AI Insight Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              AI Financial Insight
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Great job! You've saved ₦2,000 more this week compared to last week. 
              Try cutting transport costs by ₦500 daily to reach your goal faster.
            </p>
            <Link to="/chat">
              <Button variant="outline" size="sm" className="gap-2">
                Chat with AI
                <Sparkles className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Income vs Expenses Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Bar dataKey="income" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <Link to="/expenses">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground text-sm">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.category} • {transaction.date}</p>
              </div>
              <span className="font-bold text-foreground">₦{transaction.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
