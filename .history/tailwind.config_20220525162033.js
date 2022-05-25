const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  darkMode: false, // or 'media' or 'class'
  mode: "jit",
  future: {
    purgeLayersByDefault: true,
    applyComplexClasses: true,
  },
  purge: {
    content: [
      "./renderer/public/**/*.html",
      "./renderer/components/**/*.{js,ts,jsx,tsx}",
      "./renderer/components_new/**/*.{js,ts,jsx,tsx}",
      "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: {
        standard: ["outline-none"],
      },
    },
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Proxima Soft"', ...defaultTheme.fontFamily.sans],
        serif: ["Doughy", ...defaultTheme.fontFamily.serif],
        mono: [...defaultTheme.fontFamily.mono],
      },
      gradientColorStops: (theme) => ({
        ...theme("colors"),
        cardGradient:
          "linear-gradient(to right, #4C65D4, #C4309F, #DA2E7D, #F56338, #FED272)",
      }),
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      blue: colors.blue,
      white: colors.white,
      gray: colors.trueGray,
      indigo: colors.indigo,
      teal: colors.teal,
      red: colors.rose,
      green: colors.green,
      yellow: {
        light: "#F9B004",
        DEFAULT: "#FAAF04",
        dark: "#FAAF04",
      },
      primary: "#fc004a",
      secondary: "#2F5E8E",
      productBg: "#ffffff",
      greenPrimary: "#A4C900",
      plum: "#7C40C6",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/custom-forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
