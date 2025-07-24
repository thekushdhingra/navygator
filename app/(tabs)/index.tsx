import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Menu, Provider } from "react-native-paper";
import { WebView } from "react-native-webview";
import {
  addTab,
  closeTab,
  getSelectedTabId,
  getTabsFromStorage,
  setSelectedTabId,
  Tab,
} from "../../utils/tab_utils";
import { useAppTheme } from "../../utils/theme-context";

const tabResizeJS = `
  const meta = document.createElement('meta'); 
  meta.setAttribute('name', 'viewport'); 
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'); 
  document.getElementsByTagName('head')[0].appendChild(meta);
  true; 
`;

type WindowDimensions = {
  width: number;
  height: number;
};

export default function Home() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const webviewRef = useRef<WebView>(null);
  const [tabsMenuShown, setTabsMenuShown] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTabId, setSelectedTabIdState] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [windowDims, setWindowDims] = useState<WindowDimensions | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let loadedTabs = await getTabsFromStorage();

        let selectedId = await getSelectedTabId();

        if (loadedTabs.length === 0) {
          const newTab = { id: Date.now(), url: "https://www.google.com" };
          await addTab(newTab);
          loadedTabs = [newTab];
          selectedId = newTab.id;
          await setSelectedTabId(newTab.id);
          setInput(newTab.url);
        } else if (selectedId !== null) {
          const selectedTab = loadedTabs.find((tab) => tab.id === selectedId);
          if (selectedTab) {
            setInput(selectedTab.url);
          } else {
            selectedId = loadedTabs[0].id;
            await setSelectedTabId(loadedTabs[0].id);
            setInput(loadedTabs[0].url);
          }
        } else {
          selectedId = loadedTabs[0].id;
          await setSelectedTabId(loadedTabs[0].id);
          setInput(loadedTabs[0].url);
        }

        setTabs(loadedTabs);
        setSelectedTabIdState(selectedId);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  useEffect(() => {
    const dims = Dimensions.get("screen");
    setWindowDims({ width: dims.width, height: dims.height });
    Dimensions.addEventListener("change", () => {
      const dims = Dimensions.get("screen");
      setWindowDims({ width: dims.width, height: dims.height });
    });
  }, []);

  const handleGo = async () => {
    let formattedUrl = input.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(
        formattedUrl
      )}`;
    }
    setInput(formattedUrl);

    if (selectedTabId !== null) {
      const updatedTabs = tabs.map((tab) =>
        tab.id === selectedTabId ? { ...tab, url: formattedUrl } : tab
      );
      setTabs(updatedTabs);

      webviewRef.current?.injectJavaScript(
        `window.location.href = "${formattedUrl}";`
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    webviewRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <Provider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={{ color: theme.colors.text }}>Loading...</Text>
          </View>
        ) : tabs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={{ color: theme.colors.text }}>No tabs available</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              flex: 1,
              padding: tabsMenuShown ? 10 : 0,
            }}
            style={{}}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => {
                  setSelectedTabId(tab.id);
                  setSelectedTabIdState(tab.id);
                  setTabsMenuShown(false);
                }}
              >
                <View
                  style={{
                    display: !tabsMenuShown
                      ? tab.id === selectedTabId
                        ? "flex"
                        : "none"
                      : "flex",
                    flex: !tabsMenuShown ? 1 : 0,
                    margin: tabsMenuShown ? 10 : 0,
                    minHeight: tabsMenuShown ? 300 : windowDims?.height || 800,
                    width: tabsMenuShown ? 175 : windowDims?.width || 900,
                    borderRadius: 8,
                  }}
                >
                  {/* Tab Controls */}
                  {tabsMenuShown && (
                    <View
                      style={{
                        backgroundColor: theme.colors.surface,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 10,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    >
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.onSurface,
                          }}
                        >
                          <AntDesign
                            name="earth"
                            color={theme.colors.onSurface}
                            size={20}
                          />
                        </Text>
                        <Text
                          style={{
                            color: theme.colors.onSurface,
                          }}
                        >
                          Tab
                        </Text>
                      </View>
                      <Pressable
                        style={{ flex: 1 }}
                        onPress={async function () {
                          await closeTab(tab.id);

                          const tabsFetched = await getTabsFromStorage();

                          setTabs(tabsFetched);
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.onSurface,
                            textAlign: "right",
                          }}
                        >
                          <Entypo name="cross" size={20} />
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  {/* Actual Webview */}
                  <View
                    style={{
                      flex: 1,
                      borderBottomLeftRadius: tabsMenuShown ? 8 : 0,
                      borderBottomRightRadius: tabsMenuShown ? 8 : 0,
                      overflow: tabsMenuShown ? "hidden" : "scroll",
                    }}
                    pointerEvents={tabsMenuShown ? "none" : "auto"}
                  >
                    <WebView
                      ref={webviewRef}
                      injectedJavaScript={tabResizeJS}
                      source={{ uri: tab.url }}
                      style={{
                        borderBottomLeftRadius: tabsMenuShown ? 8 : 0,
                        borderBottomRightRadius: tabsMenuShown ? 8 : 0,
                      }}
                      onNavigationStateChange={(navState) => {
                        if (tab.id === selectedTabId) {
                          setInput(navState.url);

                          setTabs((prevTabs) =>
                            prevTabs.map((t) =>
                              t.id === tab.id ? { ...t, url: navState.url } : t
                            )
                          );
                        }
                      }}
                    />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View
          style={[styles.navBar, { backgroundColor: theme.colors.background }]}
        >
          <Pressable onPress={() => handleGo()}>
            <AntDesign name="home" size={24} color={theme.colors.onSurface} />
          </Pressable>
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
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleGo}
              placeholder="Search or enter URL"
              placeholderTextColor={theme.colors.onSurface}
            />
            <Pressable onPress={handleGo}>
              <Feather
                name="arrow-right"
                size={24}
                color={theme.colors.onSurface}
                style={{ marginHorizontal: 8 }}
              />
            </Pressable>
          </View>
          <Pressable
            style={{
              marginHorizontal: 10,
            }}
            onPress={async () => {
              const newTab = { id: Date.now(), url: "https://www.google.com" };
              await addTab(newTab);
              const tabsFetched = await getTabsFromStorage();
              setTabs(tabsFetched);
            }}
          >
            <Text>
              <Entypo name="plus" color={theme.colors.text} size={30} />
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTabsMenuShown(true)}
            style={{
              borderWidth: 1,
              paddingHorizontal: 5,
              paddingVertical: 1,
              borderColor: theme.colors.text,
              aspectRatio: 1,
              marginRight: 8,
              borderRadius: 5,
              width: 24,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                textAlign: "center",
              }}
            >
              {tabs.length}
            </Text>
          </Pressable>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Pressable onPress={() => setMenuVisible(true)}>
                <Entypo
                  name="dots-three-horizontal"
                  color={theme.colors.text}
                  size={20}
                />
              </Pressable>
            }
          >
            <Menu.Item
              onPress={() => router.push("/settings")}
              title="Settings"
              leadingIcon="cog-outline"
            />
          </Menu>
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
    width: "60%",
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
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
