/** @type {import('tailwindcss').Config} */
import { addDynamicIconSelectors } from "@iconify/tailwind";
import daisyUI from "daisyui";

export const content = ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"];
export const theme = {
  extend: {},
};
export const safelist = [
  "alert",
  "alert-info",
  "alert-success",
  "alert-warning",
  "alert-error",
];
export const plugins = [daisyUI, addDynamicIconSelectors];
export const daisyui = {
  themes: true, // true: all themes | false: only light + dark | array: specific themes like this ["light", "dark", "cupcake"]
  darkTheme: "dark", // name of one of the included themes for dark mode
  logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
};
