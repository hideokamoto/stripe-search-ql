// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

export default defineConfig({
  site: "https://hideokamoto.github.io",
  base: "/stripe-search-ql",
  integrations: [
    starlight({
      title: "stripe-search-ql",
      description: "TypeScript query builder for Stripe Search API",
      social: {
        github: "https://github.com/hideokamoto/stripe-search-ql",
      },
      plugins: [
        starlightTypeDoc({
          entryPoints: ["../src/index.ts"],
          tsconfig: "../tsconfig.json",
          sidebar: {
            label: "API Reference",
            collapsed: false,
          },
          typeDoc: {
            excludePrivate: true,
            excludeProtected: true,
            excludeInternal: true,
          },
        }),
      ],
      sidebar: [
        {
          label: "Getting Started",
          autogenerate: { directory: "guides", collapsed: false },
        },
        typeDocSidebarGroup,
      ],
    }),
  ],
});
