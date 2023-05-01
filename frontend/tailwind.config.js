/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    /**
     * Font Family
     */
    fontFamily: {
      sans: ["GeneralSans", "sans-serif"],
    },
    /**
     * Font Weight
     */
    fontWeight: {
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    /**
     * Spacing
     */
    spacing: {},
    /**
     * Colors
     */
    colors: {
      transparent: "rgba(0,0,0,0)",
      neutral_black: {
        DEFAULT: "rgba(0,0,0,1)",
        4: "rgba(0,0,0,.4)",
        7: "rgba(0,0,0,.7)",
        12: "rgba(0,0,0,.12)",
        16: "rgba(0,0,0,.16)",
        20: "rgba(0,0,0,.20)",
        24: "rgba(0,0,0,.24)",
        32: "rgba(0,0,0,.32)",
        48: "rgba(0,0,0,.48)",
        64: "rgba(0,0,0,.64)",
        76: "rgba(0,0,0,.76)",
        88: "rgba(0,0,0,.88)",
        100: "rgba(0,0,0,1)",
      },
      neutral_white: {
        DEFAULT: "rgba(255,255,255,1)",
        4: "rgba(255,255,255,.4)",
        7: "rgba(255,255,255,.7)",
        12: "rgba(255,255,255,.12)",
        16: "rgba(255,255,255,.16)",
        20: "rgba(255,255,255,.20)",
        24: "rgba(255,255,255,.24)",
        32: "rgba(255,255,255,.32)",
        48: "rgba(255,255,255,.48)",
        64: "rgba(255,255,255,.64)",
        76: "rgba(255,255,255,.76)",
        88: "rgba(255,255,255,.88)",
        100: "rgba(255,255,255,1)",
      },
      primary: {
        DEFAULT: "#553ADE",
        25: "#F9F8FF",
        50: "#F1EEFF",
        75: "#E2DCFF",
        100: "#C6BBFF",
        200: "#BCAFFF",
        300: "#A797FF",
        400: "#8B75FF",
        500: "#7357FF",
        600: "#6347F4",
        700: "#553ADE",
        800: "#3C28A4",
        900: "#21194D",
      },
      secondary: {
        DEFAULT: "#37B13D",
        25: "#F4FFF5",
        50: "#E9FFEA",
        75: "#CFFFD1",
        100: "#ADFCB0",
        200: "#98F89C",
        300: "#7FF183",
        400: "#5CE762",
        500: "#48D64E",
        600: "#3BC641",
        700: "#37B13D",
        800: "#2D8331",
        900: "#143E16",
      },
      gray: {
        DEFAULT: "#4F4B5C",
        25: "#F8F8F8",
        50: "#F3F3F4",
        75: "#ECECED",
        100: "#E2E2E4",
        200: "#D9D8DC",
        300: "#C6C5CA",
        400: "#B3B1B8",
        500: "#8D8A95",
        600: "#676472",
        700: "#4F4B5C",
        800: "#2E293D",
        900: "#110C22",
      },
      gray_alpha: {
        DEFAULT: "rgba(17,12,34,.72)",
        25: "rgba(17,12,34,.3)",
        50: "rgba(17,12,34,.5)",
        75: "rgba(17,12,34,.8)",
        100: "rgba(17,12,34,.12)",
        200: "rgba(17,12,34,.16)",
        300: "rgba(17,12,34,.24)",
        400: "rgba(17,12,34,.32)",
        500: "rgba(17,12,34,.48)",
        600: "rgba(17,12,34,.64)",
        700: "rgba(17,12,34,.72)",
        800: "rgba(17,12,34,.88)",
        900: "rgba(17,12,34,1)",
      },
      info: {
        DEFAULT: "#0057A7",
        25: "#F5FAFF",
        50: "#E9F4FF",
        75: "#C2E2FF",
        100: "#A0D2FF",
        200: "#71BBFF",
        300: "#45A6FF",
        400: "#1C92FF",
        500: "#0084FF",
        600: "#0076E2",
        700: "#0057A7",
        800: "#0C355A",
        900: "#0D1C2B",
      },
      success: {
        DEFAULT: "#0C7844",
        25: "#F3FDF8",
        50: "#E2FCF0",
        75: "#C6F1DD",
        100: "#A6E9C8",
        200: "#6FDAA6",
        300: "#4DCC8F",
        400: "#28C07A",
        500: "#0BAA60",
        600: "#0A9C55",
        700: "#0C7844",
        800: "#104B2F",
        900: "#0D1F11",
      },
      warning: {
        DEFAULT: "#B55E0F",
        25: "#FFFAED",
        50: "#FFF5DB",
        75: "#FFECBA",
        100: "#FFDD86",
        200: "#FFCB45",
        300: "#FDBA0F",
        400: "#F2AA09",
        500: "#E09400",
        600: "#D07D00",
        700: "#B55E0F",
        800: "#5C3111",
        900: "#27170B",
      },
      danger: {
        DEFAULT: "#B55E0F",
        25: "#FFF9F9",
        50: "#FFF1F1",
        75: "#FFE0E0",
        100: "#FFC7C7",
        200: "#FFA7A7",
        300: "#FF8080",
        400: "#F95E5E",
        500: "#F03D3D",
        600: "#CF2A2A",
        700: "#A41F1F",
        800: "#591A1A",
        900: "#271111",
      },
    },
    /**
     * Shadows
     */
    boxShadow: {
      e0: "0px 1px 0px 0px rgba(17, 12, 34, 0)",
      e1: "0px 1px 2px -1px rgba(17, 12, 34, 0.08)",
      e2: "0px 2px 4px -2px rgba(17, 12, 34, 0.12)",
      e3: "0px 6px 16px -6px rgba(17, 12, 34, 0.1)",
      e4: "0px 16px 20px -8px rgba(17, 12, 34, 0.1)",
      e5: "0px 20px 24px -10px rgba(17, 12, 34, 0.1)",
      e6: "0px 32px 32px -12px rgba(17, 12, 34, 0.12)",
      "outline-focus_gray":
        "0px 2px 4px rgba(17, 12, 34, 0.12), 0px 0px 0px 4px #ECECED",
      "outline-focus_primary":
        "0px 2px 4px rgba(17, 12, 34, 0.12), 0px 0px 0px 4px #E2DCFF",
      "outline-focus_info":
        "0px 2px 4px rgba(17, 12, 34, 0.12), 0px 0px 0px 3px #C2E2FF",
      "outline-focus_success":
        "0px 2px 4px rgba(17, 12, 34, 0.12), 0px 0px 0px 4px #C6F1DD",
      "outline-focus_warning":
        "0px 2px 4px rgba(17, 12, 34, 0.12), 0px 0px 0px 4px #FFECBA",
      "outline-focus_danger":
        "0px 2px 4px rgba(17, 12, 34, 0.12), 0px 0px 0px 4px #FFE0E0",
    },
    /**
     * Font Size
     */
    fontSize: {
      // overline
      size_overline: [
        "11px",
        { lineHeight: "16px", textTransform: "uppercase" },
      ],
      // Captions
      size_caption2: ["10px", "16px"],
      size_caption1: ["12px", "16px"],
      // Body
      size_body2: ["14px", "24px"],
      size_body1: ["16px", "24px"],
      // Titles
      size_title2: ["16px", "24px"],
      size_title1: ["18px", "24px"],
      // Headings
      size_heading6: ["22px", { lineHeight: "32px", letterSpacing: "-0.01em" }],
      size_heading5: ["28px", { lineHeight: "40px", letterSpacing: "-0.01em" }],
      size_heading4: ["32px", { lineHeight: "40px", letterSpacing: "-0.01em" }],
      size_heading3: ["44px", { lineHeight: "64px", letterSpacing: "-0.01em" }],
      size_heading2: ["52px", { lineHeight: "64px", letterSpacing: "-0.01em" }],
      size_heading1: ["64px", { lineHeight: "72px", letterSpacing: "-0.01em" }],
      // Displays
      size_display3: ["76px", "88px"],
      size_display2: ["88px", "96px"],
      size_display1: ["104px", "120px"],
    },
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {},
  },
  plugins: [],
};
