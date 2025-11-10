import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/utils/exportData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ExportMenu = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const fetchAndExport = async (
    table: 'transactions' | 'budgets' | 'reminders',
    filename: string,
    format: 'csv' | 'pdf',
    title: string
  ) => {
    try {
      setIsExporting(true);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'No Data',
          description: `No ${table} found to export`,
          variant: 'destructive',
        });
        return;
      }

      if (format === 'csv') {
        exportToCSV(data, filename);
      } else {
        await exportToPDF(data, filename, title);
      }

      toast({
        title: 'Success',
        description: `${title} exported successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => fetchAndExport('transactions', 'transactions', 'csv', 'Transactions')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Transactions (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fetchAndExport('transactions', 'transactions', 'pdf', 'Transactions Report')}>
          <FileText className="mr-2 h-4 w-4" />
          Transactions (PDF)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => fetchAndExport('budgets', 'budgets', 'csv', 'Budgets')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Budgets (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fetchAndExport('budgets', 'budgets', 'pdf', 'Budgets Report')}>
          <FileText className="mr-2 h-4 w-4" />
          Budgets (PDF)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => fetchAndExport('reminders', 'reminders', 'csv', 'Reminders')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Reminders (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fetchAndExport('reminders', 'reminders', 'pdf', 'Reminders Report')}>
          <FileText className="mr-2 h-4 w-4" />
          Reminders (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
