import type { AstroIntegration } from "astro";
import path from "node:path";

export default (): AstroIntegration => ({
  name: "update-config",
  hooks: {
    "astro:config:setup": (options) => {
      const { addWatchFile } = options;
      addWatchFile(path.resolve("frosti.config.yaml"));
      addWatchFile(path.resolve("src/i18n/translations.yaml"));
    },
  },
});
