import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isAI, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 mb-4 animate-slide-up",
      isAI ? "justify-start" : "justify-end"
    )}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3",
        isAI 
          ? "bg-muted/50 text-foreground rounded-tl-none" 
          : "bg-primary text-primary-foreground rounded-tr-none"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <span className={cn(
            "text-xs mt-1 block",
            isAI ? "text-muted-foreground" : "text-primary-foreground/70"
          )}>
            {timestamp}
          </span>
        )}
      </div>
      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
