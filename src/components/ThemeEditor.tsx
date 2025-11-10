import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, Save, RotateCcw } from "lucide-react";
import { CustomTheme } from "@/hooks/useCustomTheme";

interface ThemeEditorProps {
  initialTheme?: CustomTheme | null;
  onSave: (theme: CustomTheme) => void;
}

const DEFAULT_THEME: CustomTheme = {
  primary: "147 100% 35%",
  secondary: "180 61% 15%",
  accent: "147 100% 40%",
  background: "0 0% 98%",
  foreground: "164 85% 12%",
  muted: "45 38% 95%",
  card: "0 0% 100%",
  border: "164 25% 88%",
};

export const ThemeEditor = ({ initialTheme, onSave }: ThemeEditorProps) => {
  const [customTheme, setCustomTheme] = useState<CustomTheme>(
    initialTheme || DEFAULT_THEME
  );

  const handleColorChange = (key: keyof CustomTheme, value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    setCustomTheme(DEFAULT_THEME);
  };

  const handleSave = () => {
    onSave(customTheme);
  };

  const colorFields: { key: keyof CustomTheme; label: string; description: string }[] = [
    { key: "primary", label: "Primary", description: "Main brand color" },
    { key: "secondary", label: "Secondary", description: "Secondary UI color" },
    { key: "accent", label: "Accent", description: "Highlight color" },
    { key: "background", label: "Background", description: "Main background" },
    { key: "foreground", label: "Foreground", description: "Text color" },
    { key: "muted", label: "Muted", description: "Subtle backgrounds" },
    { key: "card", label: "Card", description: "Card backgrounds" },
    { key: "border", label: "Border", description: "Border color" },
  ];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Custom Theme Editor</h2>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {colorFields.map(({ key, label, description }) => (
          <div key={key} className="space-y-1">
            <Label className="text-sm">{label}</Label>
            <p className="text-xs text-muted-foreground mb-1">{description}</p>
            <Input
              value={customTheme[key]}
              onChange={(e) => handleColorChange(key, e.target.value)}
              placeholder="e.g., 147 100% 35%"
              className="font-mono text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={handleSave} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save Theme
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Colors must be in HSL format without "hsl()". Example: 147 100% 35%
      </p>
    </Card>
  );
};
