import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        ColorOne: '#00A8E8',
        ColorTwo: '#1C3F60',
        ColorThree: '#36454F',
        ColorFour: '#ADEFD1',
        CustomBlue: '#005E82',
        BGOne: '#EAEAEA',
        BGTwo: '#F5F5F5'
      }
    },
  },
  plugins: [],
};
export default config;
