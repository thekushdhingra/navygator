import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Menu, Provider } from "react-native-paper";
import { WebView } from "react-native-webview";
import { useAppTheme } from "../theme-context";

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("https://www.google.com");
  const webviewRef = useRef<WebView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { theme } = useAppTheme();

  const handleGo = () => {
    let formattedUrl = input.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(
        formattedUrl
      )}`;
    }
    setUrl(formattedUrl);
    setInput(formattedUrl);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webviewRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <Provider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <WebView
              ref={webviewRef}
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              onNavigationStateChange={(navState) => setInput(navState.url)}
              source={{ uri: url }}
              style={{ flex: 1, marginTop: 18 }}
              pullToRefreshEnabled
            />
          </ScrollView>

          <View
            style={[
              styles.navBar,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <TouchableOpacity onPress={() => setUrl("https://www.google.com")}>
              <AntDesign name="home" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>

            <View
              style={[styles.urlBar, { backgroundColor: theme.colors.surface }]}
            >
              <Ionicons
                name="search"
                size={20}
                color={theme.colors.onSurface}
                style={{ marginHorizontal: 8 }}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.onSurface }]}
                placeholder="Search or enter URL"
                placeholderTextColor={theme.colors.onSurface}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleGo}
              />
              {input && (
                <TouchableOpacity onPress={handleGo}>
                  <Feather
                    name="arrow-right"
                    size={24}
                    color={theme.colors.onSurface}
                    style={{ marginHorizontal: 8 }}
                  />
                </TouchableOpacity>
              )}
            </View>

            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity onPress={openMenu}>
                  <Entypo
                    name="dots-three-horizontal"
                    size={20}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  router.push("/settings");
                }}
                title="Settings"
                leadingIcon="cog-outline"
              />
            </Menu>
          </View>
        </View>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  urlBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    width: "80%",
  },
  input: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingBottom: 10,
  },
});
