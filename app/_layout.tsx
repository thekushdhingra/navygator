import { Slot } from "expo-router";
import { StatusBar } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// eslint-disable-next-line import/no-named-as-default
import ThemeProvider, { useAppTheme } from "../utils/theme-context";

function AppContent() {
  const { theme } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
}
export function isColorDark(color: string): boolean {
  const hex = color.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.5;
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ContentWithTheme />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ContentWithTheme() {
  const { theme } = useAppTheme();

  return (
    <>
      <StatusBar
        barStyle={
          isColorDark(theme.colors.background)
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={theme.colors.background}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        <AppContent />
      </SafeAreaView>
    </>
  );
}
