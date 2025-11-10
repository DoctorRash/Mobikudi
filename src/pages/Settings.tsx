import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Globe, Volume2, Palette, Moon, Sun, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { ThemeEditor } from "@/components/ThemeEditor";
import { ThemePreview } from "@/components/ThemePreview";
import { CustomTheme, useCustomTheme } from "@/hooks/useCustomTheme";
import { ExportMenu } from "@/components/ExportMenu";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('₦');
  const [language, setLanguage] = useState('en');
  const [voiceOption, setVoiceOption] = useState('en-NG');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);

  useCustomTheme(customTheme);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (data) {
      setProfile(data);
      setFullName(data.full_name || '');
      setCurrency(data.currency || '₦');
      setLanguage(data.language || 'en');
      setVoiceOption(data.voice_option || 'en-NG');
      setCustomTheme(data.custom_theme ? data.custom_theme as unknown as CustomTheme : null);
      // Theme is managed by next-themes, don't override it from DB
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        currency,
        language,
        voice_option: voiceOption,
        theme: theme || 'system'
      })
      .eq('id', user?.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    }
  };

  const handleSaveCustomTheme = async (newTheme: CustomTheme) => {
    setCustomTheme(newTheme);
    
    const { error } = await supabase
      .from('profiles')
      .update({ custom_theme: newTheme as unknown as any })
      .eq('id', user?.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setTheme('custom');
      toast({
        title: 'Success',
        description: 'Custom theme saved and applied!',
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <ExportMenu />
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <User className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Profile Information</h2>
          </div>
          
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Mary Johnson"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Preferences</h2>
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="₦">Naira (₦)</SelectItem>
                <SelectItem value="$">Dollar ($)</SelectItem>
                <SelectItem value="€">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="yo">Yoruba</SelectItem>
                <SelectItem value="pcm">Pidgin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <Volume2 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Voice Settings</h2>
          </div>

          <div className="space-y-2">
            <Label>Voice Option</Label>
            <Select value={voiceOption} onValueChange={setVoiceOption}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-NG">Nigerian English</SelectItem>
                <SelectItem value="en-US">US English</SelectItem>
                <SelectItem value="en-GB">British English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Appearance</h2>
          </div>

          <Tabs defaultValue="themes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="themes">Themes</TabsTrigger>
              <TabsTrigger value="custom">Custom Theme</TabsTrigger>
            </TabsList>
            
            <TabsContent value="themes" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label>Select Theme</Label>
                <div className="grid grid-cols-4 gap-3">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-sm">Light</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-sm">Dark</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="text-sm">System</span>
                  </Button>
                  <Button
                    variant={theme === "custom" ? "default" : "outline"}
                    onClick={() => setTheme("custom")}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    disabled={!customTheme}
                  >
                    <Palette className="h-5 w-5" />
                    <span className="text-sm">Custom</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose how MobiKudi looks. System will match your device settings.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Theme Preview</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ThemePreview themeName="Light" customColors={null} />
                  <ThemePreview themeName="Dark" customColors={null} />
                  {customTheme && (
                    <ThemePreview themeName="Custom" customColors={customTheme} />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <ThemeEditor 
                initialTheme={customTheme} 
                onSave={handleSaveCustomTheme}
              />
              {customTheme && (
                <div>
                  <Label className="mb-2 block">Live Preview</Label>
                  <ThemePreview themeName="Your Custom Theme" customColors={customTheme} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex gap-4 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={signOut} variant="destructive" className="flex-1">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
