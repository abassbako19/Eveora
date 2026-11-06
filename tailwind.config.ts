import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        eveora: {
          ink: "#101828",
          navy: "#101D3A",
          blue: "#3157D5",
          sky: "#EAF0FF",
          mint: "#DDF7EC",
          gold: "#F4C66A"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(16, 29, 58, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
