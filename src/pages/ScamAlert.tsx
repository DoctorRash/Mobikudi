import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ScamAlert = () => {
  const { toast } = useToast();
  const [messageToCheck, setMessageToCheck] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    status: "safe" | "suspicious" | "fraudulent" | null;
    confidence: number;
    reasons: string[];
  }>({ status: null, confidence: 0, reasons: [] });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMessage = () => {
    if (!messageToCheck.trim()) {
      toast({
        title: "No message provided",
        description: "Please paste a message to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const message = messageToCheck.toLowerCase();
      let status: "safe" | "suspicious" | "fraudulent" = "safe";
      let confidence = 85;
      const reasons: string[] = [];

      // Simple rule-based detection (will be replaced with actual AI)
      if (message.includes("urgent") || message.includes("immediately") || message.includes("act now")) {
        status = "suspicious";
        confidence = 75;
        reasons.push("Contains urgency tactics commonly used in scams");
      }

      if (message.includes("won") || message.includes("prize") || message.includes("lottery")) {
        status = "fraudulent";
        confidence = 92;
        reasons.push("Mentions unexpected prizes or lottery winnings");
      }

      if (message.includes("click") || message.includes("link") || message.includes("http")) {
        if (status === "safe") status = "suspicious";
        confidence = Math.max(confidence, 70);
        reasons.push("Contains suspicious links");
      }

      if (message.includes("bank") && (message.includes("verify") || message.includes("account"))) {
        status = "fraudulent";
        confidence = 95;
        reasons.push("Impersonates banking institutions");
      }

      if (message.includes("send money") || message.includes("transfer") || message.includes("payment")) {
        if (status === "safe") status = "suspicious";
        confidence = Math.max(confidence, 80);
        reasons.push("Requests money transfer");
      }

      if (status === "safe" && reasons.length === 0) {
        reasons.push("No obvious scam indicators detected");
        reasons.push("Message appears legitimate");
      }

      setAnalysisResult({ status, confidence, reasons });
      setIsAnalyzing(false);
    }, 1500);
  };

  const getStatusIcon = () => {
    switch (analysisResult.status) {
      case "safe":
        return <ShieldCheck className="w-16 h-16 text-success" />;
      case "suspicious":
        return <AlertTriangle className="w-16 h-16 text-warning" />;
      case "fraudulent":
        return <ShieldAlert className="w-16 h-16 text-destructive" />;
      default:
        return <Info className="w-16 h-16 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (analysisResult.status) {
      case "safe":
        return "from-success/5 to-success/10 border-success/20";
      case "suspicious":
        return "from-warning/5 to-warning/10 border-warning/20";
      case "fraudulent":
        return "from-destructive/5 to-destructive/10 border-destructive/20";
      default:
        return "from-muted/5 to-muted/10 border-muted/20";
    }
  };

  const getStatusText = () => {
    switch (analysisResult.status) {
      case "safe":
        return "Appears Safe";
      case "suspicious":
        return "Suspicious - Be Cautious";
      case "fraudulent":
        return "Likely Fraudulent - Do Not Engage";
      default:
        return "Paste a message to analyze";
    }
  };

  const commonScams = [
    {
      title: "Fake Bank Alerts",
      description: "Messages claiming your account needs verification",
      icon: "🏦"
    },
    {
      title: "Lottery Scams",
      description: "Winning prizes you never entered",
      icon: "🎰"
    },
    {
      title: "Investment Schemes",
      description: "Get-rich-quick opportunities with guaranteed returns",
      icon: "💰"
    },
    {
      title: "Romance Scams",
      description: "Online relationships asking for money",
      icon: "💔"
    }
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-primary" />
          Scam Alert Analyzer
        </h1>
        <p className="text-muted-foreground">AI-powered scam detection to protect your money</p>
      </div>

      {/* Analysis Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Paste Suspicious Message</h3>
          <Textarea
            placeholder="Paste the message, email, or transaction details you want to check..."
            value={messageToCheck}
            onChange={(e) => setMessageToCheck(e.target.value)}
            className="min-h-[200px] mb-4"
          />
          <Button 
            onClick={analyzeMessage} 
            className="w-full gap-2"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                Check for Scams
              </>
            )}
          </Button>
        </Card>

        {/* Result */}
        <Card className={`p-6 bg-gradient-to-br ${getStatusColor()}`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {getStatusText()}
            </h3>
            {analysisResult.status && (
              <>
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Confidence Level</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${analysisResult.confidence}%` }}
                      />
                    </div>
                    <span className="font-bold text-foreground">{analysisResult.confidence}%</span>
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <h4 className="font-semibold text-foreground">Analysis:</h4>
                  <ul className="space-y-1">
                    {analysisResult.reasons.map((reason, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Common Scams */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Common Scams in Nigeria</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commonScams.map((scam, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-all duration-300">
              <div className="text-4xl mb-2">{scam.icon}</div>
              <h4 className="font-semibold text-foreground mb-1">{scam.title}</h4>
              <p className="text-sm text-muted-foreground">{scam.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <h3 className="text-lg font-semibold text-foreground mb-3">Safety Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Never share your BVN, PIN, or OTP with anyone</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Banks will never ask for your password via email or SMS</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Be suspicious of "too good to be true" investment offers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <span>Verify sender details before clicking any links</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default ScamAlert;
