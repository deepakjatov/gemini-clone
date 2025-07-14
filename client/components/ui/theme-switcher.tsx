import { Moon, Sun, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store";

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppStore();

  const themes = [
    {
      name: "Light",
      value: "light" as const,
      icon: Sun,
      description: "Light mode",
    },
    {
      name: "Dark",
      value: "dark" as const,
      icon: Moon,
      description: "Dark mode",
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between hover:bg-sidebar-accent"
        >
          <div className="flex items-center">
            <CurrentIcon className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </div>
          <ChevronRight className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]" side="right">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          APPEARANCE
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;

          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className="flex items-center justify-between py-2.5 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">{themeOption.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </div>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
