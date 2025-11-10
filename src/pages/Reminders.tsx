import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

const Reminders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderType, setReminderType] = useState("");

  useEffect(() => {
    if (user) {
      fetchReminders();
      checkRecurringTransactions();
    }
  }, [user]);

  const fetchReminders = async () => {
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user?.id)
      .order('due_date', { ascending: true });

    if (data) setReminders(data);
  };

  const checkRecurringTransactions = async () => {
    const { data: recurring } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_active', true);

    if (recurring) {
      for (const txn of recurring) {
        const nextOccurrence = new Date(txn.next_occurrence);
        const threeDaysBefore = new Date(nextOccurrence);
        threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        threeDaysBefore.setHours(0, 0, 0, 0);

        if (threeDaysBefore.getTime() === today.getTime()) {
          const { data: existingReminder } = await supabase
            .from('reminders')
            .select('*')
            .eq('user_id', user?.id)
            .eq('title', `${txn.title} due soon`)
            .eq('due_date', txn.next_occurrence)
            .single();

          if (!existingReminder) {
            await supabase.from('reminders').insert({
              user_id: user?.id,
              title: `${txn.title} due soon`,
              description: `Your recurring ${txn.type} "${txn.title}" of ₦${Number(txn.amount).toLocaleString()} is due on ${format(nextOccurrence, 'MMM dd, yyyy')}`,
              due_date: txn.next_occurrence,
              reminder_type: 'recurring_transaction'
            });
          }
        }
      }
      fetchReminders();
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('reminders').insert({
      user_id: user?.id,
      title,
      description,
      due_date: dueDate,
      reminder_type: reminderType || 'custom'
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create reminder',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Reminder created successfully',
      });
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setReminderType("");
      fetchReminders();
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_completed: !isCompleted })
      .eq('id', id);

    if (!error) {
      fetchReminders();
      toast({
        title: 'Updated',
        description: 'Reminder status updated',
      });
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchReminders();
      toast({
        title: 'Deleted',
        description: 'Reminder deleted successfully',
      });
    }
  };

  const upcomingReminders = reminders.filter(r => !r.is_completed && new Date(r.due_date) >= new Date());
  const pastReminders = reminders.filter(r => !r.is_completed && new Date(r.due_date) < new Date());
  const completedReminders = reminders.filter(r => r.is_completed);

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Reminders</h1>
          <p className="text-muted-foreground">Stay on top of your bills and transactions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddReminder} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Pay rent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details..."
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type (Optional)</Label>
                <Input
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value)}
                  placeholder="e.g., bill, subscription"
                />
              </div>
              <Button type="submit" className="w-full">
                Create Reminder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcomingReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <Card key={reminder.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={reminder.is_completed}
                    onCheckedChange={() => handleToggleComplete(reminder.id, reminder.is_completed)}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{reminder.title}</h3>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(reminder.due_date), 'MMM dd, yyyy')}</span>
                          {reminder.reminder_type && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                              {reminder.reminder_type}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pastReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-destructive mb-3">Past Due</h2>
          <div className="space-y-3">
            {pastReminders.map((reminder) => (
              <Card key={reminder.id} className="p-4 border-destructive/50 bg-destructive/5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={reminder.is_completed}
                    onCheckedChange={() => handleToggleComplete(reminder.id, reminder.is_completed)}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{reminder.title}</h3>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(reminder.due_date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-muted-foreground mb-3">Completed</h2>
          <div className="space-y-3">
            {completedReminders.map((reminder) => (
              <Card key={reminder.id} className="p-4 opacity-60">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={reminder.is_completed}
                    onCheckedChange={() => handleToggleComplete(reminder.id, reminder.is_completed)}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground line-through">{reminder.title}</h3>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <Card className="p-8 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-2">No reminders yet</h3>
          <p className="text-muted-foreground mb-4">
            Create reminders for bills and recurring transactions
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Reminder
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Reminders;