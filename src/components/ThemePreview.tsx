import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface ThemePreviewProps {
  themeName: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    card: string;
    border: string;
  } | null;
}

export const ThemePreview = ({ themeName, customColors }: ThemePreviewProps) => {
  const previewStyle = customColors ? {
    '--primary': customColors.primary,
    '--secondary': customColors.secondary,
    '--accent': customColors.accent,
    '--background': customColors.background,
    '--foreground': customColors.foreground,
    '--muted': customColors.muted,
    '--card': customColors.card,
    '--border': customColors.border,
  } as React.CSSProperties : {};

  return (
    <Card className="p-4" style={previewStyle}>
      <div className="space-y-4">
        <div className="text-center pb-2 border-b">
          <h3 className="font-semibold text-foreground">{themeName} Preview</h3>
          <p className="text-sm text-muted-foreground">Preview of UI elements</p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm">Primary Button</Button>
            <Button size="sm" variant="secondary">Secondary</Button>
            <Button size="sm" variant="outline">Outline</Button>
            <Button size="sm" variant="destructive">Destructive</Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sample Card</CardTitle>
              <CardDescription className="text-xs">Card with content</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-xs text-muted-foreground">
                This is how cards will look in your theme.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Input placeholder="Input field" className="text-sm" />
            <div className="flex items-center gap-2">
              <Switch />
              <span className="text-xs text-muted-foreground">Toggle switch</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Error</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
