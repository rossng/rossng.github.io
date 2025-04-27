import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    markdoc(),
    mdx(),
    icon(),
    sitemap({
      filter: (page) => !page.includes("draft"),
    }),
  ],

  output: "static",
  site: "https://rossng.eu",

  redirects: {
    "/2020/04/11/my-first-llvm-program.html":
      "/posts/2020-04-11-my-first-llvm-program",
    "/projects/2018/08/10/thesis-free-trade.html":
      "/posts/2018-08-10-free-trade",
    "/projects/2017/06/05/loan-shark.html": "/posts/2017-06-05-loan-shark",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
