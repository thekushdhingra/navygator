import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type ThemeMode = "light" | "dark" | "custom";

type CustomTheme = {
  primary?: string;
  background?: string;
  surface?: string;
  text?: string;
};

export type Theme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    surfaceVariant: string;
    onSurface: string;
    accent: string;
    secondaryBackground: string;
  };
};

const Light: Theme = {
  dark: false,
  colors: {
    primary: "#000000ff",
    background: "#ffffffff",
    surface: "#f2f2f2",
    text: "#17181eff",
    surfaceVariant: "#ccd0da",
    onSurface: "#4c4f69",
    accent: "#000000ff",
    secondaryBackground: "#dce0e8",
  },
};

const Dark: Theme = {
  dark: true,
  colors: {
    primary: "#000000ff",
    background: "#000000ff",
    surface: "#101010ff",
    text: "#e0e7ff",
    surfaceVariant: "#2e3440",
    onSurface: "#e0e7ff",
    accent: "#ffffffff",
    secondaryBackground: "#1c2526",
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (color: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: CustomTheme) => void;
  mode: ThemeMode;
  accentColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: Dark,
  toggleTheme: () => {},
  setTheme: (_: ThemeMode) => {},
  setAccent: (_: string) => {},
  setThemeMode: (_: ThemeMode) => {},
  setCustomTheme: (_: CustomTheme) => {},
  mode: "dark",
  accentColor: Dark.colors.accent,
});

export const useAppTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [accentColor, setAccentColor] = useState<string>(Dark.colors.accent);
  const [customTheme, setCustomThemeState] = useState<CustomTheme>({});

  const baseTheme = mode === "dark" ? Dark : Light;

  useEffect(() => {
    if (mode !== "custom") {
      setAccentColor(baseTheme.colors.accent);
    }
  }, [mode, baseTheme]);

  const mergedTheme =
    mode === "custom"
      ? createTheme(baseTheme, accentColor, customTheme)
      : createTheme(baseTheme, accentColor, {});

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setCustomTheme = (theme: CustomTheme) => {
    setCustomThemeState(theme);
    setMode("custom");
  };

  const setTheme = (theme: ThemeMode) => {
    setMode(theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: mergedTheme,
        toggleTheme,
        setTheme,
        setAccent: setAccentColor,
        setThemeMode: setMode,
        setCustomTheme,
        mode,
        accentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function createTheme(
  baseTheme: Theme,
  accentColor: string,
  customTheme: CustomTheme
): Theme {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: customTheme.primary ?? accentColor,
      background: customTheme.background ?? baseTheme.colors.background,
      surface: customTheme.surface ?? baseTheme.colors.surface,
      surfaceVariant: customTheme.surface ?? baseTheme.colors.surfaceVariant,
      onSurface: customTheme.text ?? baseTheme.colors.onSurface,
      accent: accentColor,
      secondaryBackground:
        customTheme.surface ?? baseTheme.colors.surfaceVariant,
    },
  };
}

export default ThemeProvider;
