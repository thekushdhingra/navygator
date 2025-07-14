import { Slot } from "expo-router";
import { StatusBar } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider, { useAppTheme } from "./theme-context";

function AppContent() {
  const { theme } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
}

export default function Layout() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar backgroundColor={theme.colors.background}  />
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
