import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { AstroIntegration } from "astro";

import { SITE_THEME } from "../config";

const CONFIG_FILE = path.resolve("frosti.config.yaml");
const TRANSLATIONS_FILE = path.resolve("src/i18n/translations.yaml");
const DAISY_THEMES_FILE = path.resolve("src/styles/daisyui-themes.css");

const renderDaisyThemes = (): string => {
  const themes = [SITE_THEME.light, SITE_THEME.dark].filter(
    (theme, index, all) => theme && all.indexOf(theme) === index,
  );
  // Mark the light theme as default so an unknown data-theme (for example a
  // stale localStorage value from a previous configuration) still renders.
  const themeEntries = themes.map((theme, index) =>
    index === 0 ? `${theme} --default` : theme,
  );

  return [
    "/* Auto-generated from frosti.config.yaml by src/integration/updateConfig.ts. */",
    "/* Do not edit; change `site.theme` in frosti.config.yaml instead. */",
    '@plugin "daisyui" {',
    `  themes: ${themeEntries.join(", ")};`,
    "  logs: false;",
    "}",
    "",
  ].join("\n");
};

const updateConfigIntegration = (): AstroIntegration => ({
  name: "update-config",
  hooks: {
    "astro:config:setup": ({ addWatchFile }) => {
      addWatchFile(CONFIG_FILE);
      addWatchFile(TRANSLATIONS_FILE);

      const content = renderDaisyThemes();
      if (
        !existsSync(DAISY_THEMES_FILE) ||
        readFileSync(DAISY_THEMES_FILE, "utf8") !== content
      ) {
        writeFileSync(DAISY_THEMES_FILE, content);
      }
    },
  },
});

export default updateConfigIntegration;
