const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  darkMode: false, // or 'media' or 'class'
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
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
