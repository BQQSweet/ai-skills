import type { Config } from "tailwindcss";
import {
  basePreset,
  elementPlusPreset,
  miniprogramBasePreset,
} from "tailwind-extensions";
import { isMp, isQuickapp } from "@uni-helper/uni-env";

const presets: Config["presets"] = [basePreset];
if (isMp || isQuickapp) {
  presets.push(
    elementPlusPreset({
      baseSelectors: [":root", "page"],
    }),
    miniprogramBasePreset,
  );
} else {
  presets.push(elementPlusPreset());
}

const theme: Config["theme"] = {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#ff9d0a",
        dark: "#e08a00",
        light: "#ffb733",
      },
      background: {
        light: "#fafafa",
        dark: "#231b0f",
        input: "#f8f7f5",
        cooking: "#0a0a0a",
      },
      surface: {
        dark: "#1a150e",
      },
      card: {
        dark: "#2d2418",
      },
      text: {
        main: "#1d160c",
        muted: "#a17c45",
      },
      wechat: "#07c160",
    },
  },
};
if (isMp || isQuickapp) theme.screens = {};

const config: Config = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  presets,
  theme,
};

export default config;
