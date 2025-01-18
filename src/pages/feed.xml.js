import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("posts");
  return rss({
    // `<title>` field in output xml
    title: "Ross Gardiner's blog",
    // `<description>` field in output xml
    description:
      "An infrequently-updated blog about technology and my thoughts",
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        // Compute RSS link from post `slug`
        // This example assumes all posts are rendered as `/blog/[slug]` routes
        link: `/posts/${post.slug}/`,
      })),
    // (optional) inject custom xml
    customData: `<language>en-gb</language>`,
  });
}
