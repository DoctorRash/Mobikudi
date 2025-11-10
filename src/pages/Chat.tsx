import { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Mic, MicOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: "1",
      message: "Hello! I'm your AI financial assistant. How can I help you manage your money better today?",
      isAI: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.isAI ? "assistant" : "user",
              content: msg.message
            })),
            { role: "user", content: currentInput }
          ]
        }),
      });

      if (response.status === 429) {
        toast({
          title: "Rate limit exceeded",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast({
          title: "Service unavailable",
          description: "Please contact support.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let aiMessageId = (Date.now() + 1).toString();
      let assistantContent = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === aiMessageId) {
                  return prev.map(m => 
                    m.id === aiMessageId 
                      ? { ...m, message: assistantContent }
                      : m
                  );
                }
                return [...prev, {
                  id: aiMessageId,
                  message: assistantContent,
                  isAI: true,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      toast({
        title: "Voice input activated",
        description: "Speak now... (Demo mode - voice features coming soon)",
      });
      setTimeout(() => {
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const quickPrompts = [
    "How can I save more money?",
    "Analyze my spending this month",
    "Tips to reduce transport costs",
    "Should I invest now?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] pb-24 lg:pb-0">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Financial Assistant
        </h1>
        <p className="text-muted-foreground">Get personalized advice in English, Yoruba, or Pidgin</p>
      </div>

      {/* Quick Prompts */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {quickPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setInputMessage(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>

      {/* Messages Container */}
      <Card className="flex-1 p-4 overflow-y-auto mb-4 bg-gradient-to-b from-background to-muted/20">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Ask me anything about your finances..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            onClick={handleVoiceInput}
            className={isListening ? "animate-pulse-glow" : ""}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        </div>
        <Button onClick={handleSendMessage} size="icon" disabled={isLoading}>
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Chat;
