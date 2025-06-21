
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { useToast } from "@/hooks/use-toast";

export function ModeToggle() {
  const { settings, updateTheme } = useChat();
  const { toast } = useToast();
  
  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    // Explicitly pass the current template to ensure it is maintained
    updateTheme(settings.template, newDarkMode);
    
    toast({
      title: newDarkMode ? "Включен темный режим" : "Включен светлый режим",
      description: `Тема обновлена.`,
    });
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      aria-label="Включить темный режим"
    >
      {settings.darkMode ? (
        <Moon className="h-5 w-5 transition-all" />
      ) : (
        <Sun className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Включить темный режим</span>
    </Button>
  );
}
