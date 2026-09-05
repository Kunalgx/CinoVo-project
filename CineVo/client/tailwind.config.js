export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cine: {
          bg: "var(--cine-bg)",
          panel: "var(--cine-panel)",
          card: "var(--cine-card)",
          border: "var(--cine-border)",
          muted: "var(--cine-muted)",
          gold: "#f5c518",
          accent: "#e56b55",
          input: "var(--cine-input)",
        },
      },
    },
  },
  plugins: [],
};
