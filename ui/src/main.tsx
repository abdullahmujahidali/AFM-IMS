/* eslint-disable @typescript-eslint/no-explicit-any */
import "@mantine/core/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { createTheme, MantineProvider, rem } from "@mantine/core";

const theme = createTheme({
  colors: {
    // Add your custom color
    deepBlue: [
      "#eef3ff",
      "#dce4f5",
      "#b9c7e2",
      "#94a8d0",
      "#748dc1",
      "#5f7cb8",
      "#5474b4",
      "#44639f",
      "#39588f",
      "#2d4b81",
    ],
    // Replace default theme color
    blue: [
      "#eef3ff",
      "#dee2f2",
      "#bdc2de",
      "#98a0ca",
      "#7a84ba",
      "#6672b0",
      "#5c68ac",
      "#4c5897",
      "#424e88",
      "#364379",
    ],
    primary: [
      "#eef3ff",
      "#dee2f2",
      "#bdc2de",
      "#98a0ca",
      "#7a84ba",
      "#6672b0",
      "#5c68ac",
      "#4c5897",
      "#424e88",
      "#364379",
    ],
    secondary: [
      "#fffbeb",
      "#fff3c4",
      "#fce588",
      "#fadb5f",
      "#f7c948",
      "#f0b429",
      "#de911d",
      "#cb6e17",
      "#b44d12",
      "#8d2b0b",
    ],
    success: [
      "#e6fffa",
      "#b2f5ea",
      "#81e6d9",
      "#4fd1c5",
      "#38b2ac",
      "#319795",
      "#2c7a7b",
      "#285e61",
      "#234e52",
      "#1d4044",
    ],
    danger: [
      "#ffe5e5",
      "#feb2b2",
      "#fc8181",
      "#f56565",
      "#e53e3e",
      "#c53030",
      "#9b2c2c",
      "#822727",
      "#63171b",
      "#4a1010",
    ],
    warning: [
      "#fffaf0",
      "#feebc8",
      "#fbd38d",
      "#f6ad55",
      "#ed8936",
      "#dd6b20",
      "#c05621",
      "#9c4221",
      "#7b341e",
      "#652b19",
    ],
    info: [
      "#ebf8ff",
      "#bee3f8",
      "#90cdf4",
      "#63b3ed",
      "#4299e1",
      "#3182ce",
      "#2b6cb0",
      "#2c5282",
      "#2a4365",
      "#1A365D",
    ],
    light: [
      "#f8f9fa",
      "#e9ecef",
      "#dee2e6",
      "#ced4da",
      "#adb5bd",
      "#6c757d",
      "#495057",
      "#343a40",
      "#212529",
      "#121417",
    ],
    dark: [
      "#343a40",
      "#23272b",
      "#1d2124",
      "#121417",
      "#0c0d0f",
      "#050506",
      "#030304",
      "#020203",
      "#010101",
      "#000000",
    ],
  },
  shadows: {
    md: "1px 1px 3px rgba(0, 0, 0, .25)",
    xl: "5px 5px 3px rgba(0, 0, 0, .25)",
  },
  headings: {
    fontFamily: "Roboto, sans-serif",
    sizes: {
      h1: { fontSize: rem(36) },
      h2: { fontSize: rem(30) },
      h3: { fontSize: rem(24) },
      h4: { fontSize: rem(20) },
      h5: { fontSize: rem(16) },
      h6: { fontSize: rem(14) },
    },
  },
  components: {
    Button: {
      styles: (theme: any) => ({
        root: {
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          borderRadius: theme.radius.sm,
        },
      }),
    },
    Input: {
      styles: (theme: any) => ({
        input: {
          borderColor: theme.colors.gray[4],
          "&:focus": {
            borderColor: theme.colors.blue[6],
          },
        },
      }),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
