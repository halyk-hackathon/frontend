import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { SettingsDialog } from "./SettingsDialog";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import {
  Home,
  PlusCircle,
  Search,
  Globe,
  Volume2,
  VolumeX,
  Bell,
  BellDot,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  className?: string;
  arenaMode?: boolean;
}

export function Header({ className, arenaMode }: HeaderProps) {
  const {
    createNewConversation,
    settings,
    toggleWebSearch,
    toggleAudioResponse,
  } = useChat();
  const location = useLocation();

  // В будущем подключите реальное хранилище
  const hasNotifications = true;

  return (
    <header
      className={cn(
        "flex items-center justify-between p-4 border-b backdrop-blur-sm bg-background/80 sticky top-0 z-10",
        className
      )}
    >
      {/* ==== Логотип + название ==== */}
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Halyk Autopilot
        </h1>
      </div>

      {/* ==== Навигация и действия ==== */}
      <div className="flex items-center space-x-3">
        {location.pathname !== "/" && (
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Главная"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex"
          onClick={() => createNewConversation()}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Новый чат
        </Button>


        

        {/* ==== Уведомления ==== */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Уведомления"
                className={
                  hasNotifications
                    ? "text-red-500 animate-pulse-icon"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {hasNotifications ? (
                  <BellDot className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>
                {hasNotifications
                  ? "Есть важные уведомления: налоги, ЗП"
                  : "Нет новых уведомлений"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* ==== Тема ==== */}
        <ModeToggle />
      </div>
    </header>
  );
}
