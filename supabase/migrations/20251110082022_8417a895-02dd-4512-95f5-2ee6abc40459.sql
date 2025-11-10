-- Create recurring_transactions table
CREATE TABLE public.recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  type text NOT NULL, -- 'income' or 'expense'
  frequency text NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date, -- optional, null means ongoing
  next_occurrence date NOT NULL,
  is_active boolean DEFAULT true,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own recurring transactions"
ON public.recurring_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transactions"
ON public.recurring_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
ON public.recurring_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
ON public.recurring_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recurring_transactions_updated_at
BEFORE UPDATE ON public.recurring_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();