import { Button } from "@assets/components/ui/button";
import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export function Lightswitch() {
  const [theme, setTheme] = useState<string | undefined>(
    window.localStorage.theme,
  );

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }, [theme]);

  const isDark =
    theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        window.localStorage.theme = theme === "dark" ? "light" : "dark";
        setTheme(isDark ? "light" : "dark");
      }}
    >
      {isDark ? <MdDarkMode /> : <MdLightMode />}
    </Button>
  );
}
