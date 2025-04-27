import Giscus from "@giscus/react";
import { useEffect, useState } from "react";

export function Comments() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const updateTheme = () => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    };

    // Initial theme check
    updateTheme();

    // Create a MutationObserver to watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Giscus
      id="comments"
      repo="rossng/rossng.github.io"
      repoId="MDEwOlJlcG9zaXRvcnkzMzU0ODExNA=="
      category="Comments"
      categoryId="DIC_kwDOAf_nUs4Cl5JL"
      mapping="pathname"
      strict="1"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="bottom"
      theme={theme}
      lang="en"
      loading="lazy"
    />
  );
}
