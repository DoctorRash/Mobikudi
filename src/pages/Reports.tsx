import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

const Reports = () => {
  const { user } = useAuth();
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (user) {
      fetchTransactionsData();
    }
  }, [user, selectedMonth]);

  const fetchTransactionsData = async () => {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('type', 'expense')
      .order('transaction_date', { ascending: false });

    if (transactions && transactions.length > 0) {
      processCategoryData(transactions);
      processMonthlyTrend(transactions);
      processInsights(transactions);
    } else {
      setCategoryData([]);
      setMonthlyTrend([]);
      setInsights([]);
    }
  };

  const processCategoryData = (transactions: any[]) => {
    const categoryMap = new Map();
    transactions.forEach(txn => {
      const current = categoryMap.get(txn.category) || 0;
      categoryMap.set(txn.category, current + Number(txn.amount));
    });

    const data = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
    setCategoryData(data);
  };

  const processMonthlyTrend = (transactions: any[]) => {
    const monthMap = new Map();
    transactions.forEach(txn => {
      const month = new Date(txn.transaction_date).toLocaleString('default', { month: 'short' });
      const current = monthMap.get(month) || 0;
      monthMap.set(month, current + Number(txn.amount));
    });

    const data = Array.from(monthMap.entries()).map(([month, amount]) => ({
      month,
      amount
    }));
    setMonthlyTrend(data);
  };

  const processInsights = (transactions: any[]) => {
    if (transactions.length === 0) return;

    const categoryMap = new Map();
    transactions.forEach(txn => {
      const current = categoryMap.get(txn.category) || 0;
      categoryMap.set(txn.category, current + Number(txn.amount));
    });

    const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);
    const total = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
    const avgDaily = total / 30;

    const insightsData = [
      {
        title: "Highest Spending Category",
        value: sortedCategories[0]?.[0] || "N/A",
        amount: `₦${sortedCategories[0]?.[1]?.toLocaleString() || 0}`,
        trend: "",
        isPositive: false,
        icon: TrendingUp
      },
      {
        title: "Total Monthly Spending",
        value: `₦${total.toLocaleString()}`,
        amount: `${transactions.length} transactions`,
        trend: "",
        isPositive: true,
        icon: TrendingDown
      },
      {
        title: "Average Daily Spending",
        value: `₦${avgDaily.toFixed(0).toLocaleString()}`,
        amount: `₦${total.toLocaleString()}`,
        trend: "",
        isPositive: false,
        icon: TrendingUp
      }
    ];
    setInsights(insightsData);
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Financial Reports</h1>
          <p className="text-muted-foreground">Analyze your spending patterns and trends</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="april">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="april">April 2024</SelectItem>
              <SelectItem value="march">March 2024</SelectItem>
              <SelectItem value="february">February 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.length > 0 ? insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={index} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{insight.title}</p>
                  <h3 className="text-xl font-bold text-foreground">{insight.value}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{insight.amount}</p>
                </div>
                <Icon className={insight.isPositive ? "text-success" : "text-destructive"} />
              </div>
            </Card>
          );
        }) : (
          <Card className="p-5 col-span-3 text-center">
            <p className="text-muted-foreground">No transaction data yet. Add expenses to see insights.</p>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₦${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </Card>

        {/* Monthly Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Spending Trend</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  formatter={(value: number) => `₦${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Category Breakdown</h3>
          <div className="space-y-3">
            {categoryData.map((category, index) => {
              const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
              const percentage = (category.value / total) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                    <span className="text-sm font-bold text-foreground">
                      ₦{category.value.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;
