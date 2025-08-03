import FaviconOrFallback from "@/components/favicon";
import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
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
import * as firebase from "../../utils/firebaseHandler";
import {
  addGuestTab,
  addTab,
  closeGuestTab,
  closeTab,
  getGuestSelectedTabId,
  getGuestTabsFromStorage,
  getSelectedTabId,
  getTabsFromStorage,
  setGuestSelectedTabId,
  setGuestTabsToStorage,
  setSelectedTabId,
  Tab,
} from "../../utils/tab_utils";
import { useAppTheme } from "../../utils/theme-context";

export default function Home() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const webviewRef = useRef<WebView>(null);
  const [tabsMenuShown, setTabsMenuShown] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTabId, setSelectedTabIdState] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [windowDims, setWindowDims] = useState<{
    width: number;
    height: number;
  }>({
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
  });
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (firebase.auth.currentUser && firebase.auth.currentUser.email) {
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        firebase.createHistory(firebase.auth.currentUser.email, tab.url);
        console.log(`${i + 1}) id: ${tab.id} and url: ${tab.url}`);
      }
    }
  }, [tabs]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let loadedTabs: Tab[] = [];
      const currentUser = await firebase.auth.authStateReady();
      setIsGuest(currentUser === null);
      let selectedId: number | null = null;

      if (firebase.auth?.currentUser) {
        loadedTabs = await getTabsFromStorage();
        selectedId = await getSelectedTabId();
      } else {
        // Guest mode
        setIsGuest(true);
        loadedTabs = await getGuestTabsFromStorage();
        selectedId = await getGuestSelectedTabId();
      }

      if (loadedTabs.length === 0) {
        const newTab = { id: Date.now(), url: "https://www.google.com" };
        if (isGuest || !firebase.auth?.currentUser) {
          await addGuestTab(newTab);
        } else {
          await addTab(newTab);
        }
        loadedTabs = [newTab];
        selectedId = newTab.id;
        if (isGuest || !firebase.auth?.currentUser) {
          await setGuestSelectedTabId(newTab.id);
        } else {
          await setSelectedTabId(newTab.id);
        }
        setInput(newTab.url);
      } else if (selectedId !== null) {
        const selectedTab = loadedTabs.find((tab) => tab.id === selectedId);
        if (selectedTab) {
          setInput(selectedTab.url);
        } else {
          selectedId = loadedTabs[0].id;
          if (isGuest || !firebase.auth?.currentUser) {
            await setGuestSelectedTabId(loadedTabs[0].id);
          } else {
            await setSelectedTabId(loadedTabs[0].id);
          }
          setInput(loadedTabs[0].url);
        }
      } else {
        selectedId = loadedTabs[0].id;
        if (isGuest || !firebase.auth?.currentUser) {
          await setGuestSelectedTabId(loadedTabs[0].id);
        } else {
          await setSelectedTabId(loadedTabs[0].id);
        }
        setInput(loadedTabs[0].url);
      }

      setTabs(loadedTabs);
      setSelectedTabIdState(selectedId);
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (isGuest || !firebase.auth?.currentUser) {
        await setGuestTabsToStorage(updatedTabs);
      } else {
      }

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

  if (isGuest) {
    // GUEST MODE UI
    return (
      <Provider>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              filter: theme.dark ? "" : "invert(1)",
            }}
          >
            <Image
              style={{ width: 200, height: 200, marginBottom: 24 }}
              source={require("../../assets/images/icon.png")}
              resizeMode="contain"
            />
          </View>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Experience Navygator in its full potential!
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Sign in to sync your history, unlock AI features to enhance your
            workflow.
          </Text>
          <Pressable
            style={{
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 32,
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
            onPress={() => router.push("/login")}
          >
            <Text
              style={{
                color: theme.colors.onSurface,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Sign In
            </Text>
          </Pressable>
          <Pressable onPress={() => setIsGuest(false)}>
            <Text
              style={{
                color: theme.colors.text,
                textDecorationLine: "underline",
                fontSize: 15,
              }}
            >
              I don&apos;t want to sign in
            </Text>
          </Pressable>
        </SafeAreaView>
      </Provider>
    );
  }

  // --- MAIN APP ---
  return (
    <Provider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
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
              scrollEnabled={false}
              onChangeText={setInput}
              onSubmitEditing={handleGo}
              placeholder="Search or enter URL"
              textAlign="left"
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
          {tabsMenuShown && (
            <Pressable
              style={{
                marginHorizontal: 10,
              }}
              onPress={async () => {
                const newTab = {
                  id: Date.now(),
                  url: "https://www.google.com",
                };
                if (isGuest || !firebase.auth?.currentUser) {
                  await addGuestTab(newTab);
                  const tabsFetched = await getGuestTabsFromStorage();
                  setTabs(tabsFetched);
                } else {
                  await addTab(newTab);
                  const tabsFetched = await getTabsFromStorage();
                  setTabs(tabsFetched);
                }
                await setSelectedTabId(newTab.id);
              }}
            >
              <Text>
                <Entypo name="plus" color={theme.colors.text} size={30} />
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setTabsMenuShown(true)}
            style={{
              borderWidth: 1.5,
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
          {selectedText && (
            <Pressable
              style={{
                marginHorizontal: 0,
              }}
              onPress={async () => {
                const chat = await firebase.chatwithAI(
                  "Summarise this: " + selectedText,
                  firebase.auth.currentUser.email
                );
                await AsyncStorage.setItem("openChatID", chat.id);
                router.push({
                  pathname: "/chatbot",
                  params: {
                    chatID: chat.id,
                  },
                });
              }}
            >
              <Text>
                <Ionicons
                  name="sparkles-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </Text>
            </Pressable>
          )}
          <Menu
            visible={menuVisible}
            theme={{
              colors: {
                elevation: {
                  level2: theme.colors.background,
                },
              },
            }}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Pressable onPress={() => setMenuVisible(true)}>
                <Entypo
                  name="dots-three-vertical"
                  color={theme.colors.text}
                  size={20}
                />
              </Pressable>
            }
          >
            {!firebase.auth.currentUser && (
              <Menu.Item
                onPress={() => router.push("/login")}
                title="Sign In"
                leadingIcon="account-plus-outline"
                titleStyle={{
                  color: theme.colors.text,
                }}
              />
            )}
            {firebase.auth.currentUser && (
              <Menu.Item
                title="Sign Out"
                titleStyle={{
                  color: theme.colors.text,
                }}
                leadingIcon="exit-to-app"
                onPress={async function () {
                  await firebase.auth.signOut();
                  setIsGuest(true);
                }}
              />
            )}
            {!isGuest && firebase.auth.currentUser && (
              <Menu.Item
                onPress={() => router.push("/history")}
                title="History"
                leadingIcon="history"
                titleStyle={{
                  color: theme.colors.text,
                }}
              />
            )}
            {!isGuest && firebase.auth.currentUser && (
              <Menu.Item
                onPress={() => router.push("/chatlist")}
                title="Chat with AI"
                leadingIcon="robot"
                titleStyle={{
                  color: theme.colors.text,
                }}
              />
            )}
            <Menu.Item
              onPress={() => router.push("/settings")}
              title="Settings"
              titleStyle={{
                color: theme.colors.text,
              }}
              leadingIcon="cog-outline"
            />
          </Menu>
        </View>
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
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: windowDims.width,
              height: windowDims.height,
              padding: tabsMenuShown ? 10 : 0,
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={{
                  flex: 0,
                  width: tabsMenuShown
                    ? windowDims.width / 2.15
                    : windowDims.width,
                  overflow: "scroll",
                  display: !tabsMenuShown
                    ? tab.id === selectedTabId
                      ? "flex"
                      : "none"
                    : "flex",
                }}
                onPress={async () => {
                  if (isGuest || !firebase.auth?.currentUser) {
                    await setGuestSelectedTabId(tab.id);
                  } else {
                    await setSelectedTabId(tab.id);
                  }
                  setSelectedTabIdState(tab.id);
                  setTabsMenuShown(false);
                }}
              >
                <View
                  style={{
                    flex: tabsMenuShown ? 0 : 1,
                    width: tabsMenuShown
                      ? windowDims.width / 2.15
                      : windowDims.width,
                    backgroundColor: theme.colors.surface,
                    borderRadius: 8,
                    [tabsMenuShown ? "height" : "minHeight"]: tabsMenuShown
                      ? 300
                      : windowDims.height,
                  }}
                >
                  {/* Tab Controls */}
                  {tabsMenuShown && (
                    <View
                      style={{
                        flex: 0,
                        backgroundColor: theme.colors.surface,
                        width: tabsMenuShown
                          ? windowDims.width / 2.15
                          : windowDims.width,
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        padding: 10,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    >
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          flex: 0,
                          gap: 10,
                        }}
                      >
                        <FaviconOrFallback url={tab.url} />
                        <Text
                          style={{
                            color: theme.colors.onSurface,
                          }}
                        >
                          {tab.url
                            ? new URL(tab.url).hostname
                                .split(".")
                                .slice(-2, -1)[0]
                                .split(/[-_]/)
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join("")
                            : "Tab"}
                        </Text>
                      </View>
                      <Pressable
                        style={{ flex: 1 }}
                        onPress={async function () {
                          if (isGuest || !firebase.auth?.currentUser) {
                            await closeGuestTab(tab.id);
                            const tabsFetched = await getGuestTabsFromStorage();
                            setTabs(tabsFetched);
                          } else {
                            await closeTab(tab.id);
                            const tabsFetched = await getTabsFromStorage();
                            setTabs(tabsFetched);
                          }
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.onSurface,
                            textAlign: "right",
                          }}
                        >
                          <Entypo
                            name="cross"
                            size={20}
                            color={theme.colors.onSurface}
                          />
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  {/* WebView */}
                  <View
                    style={{
                      flex: 1,
                      width: tabsMenuShown
                        ? windowDims.width / 2.15
                        : windowDims.width,
                      overflow: tabsMenuShown ? "hidden" : "scroll",
                      borderBottomLeftRadius: tabsMenuShown ? 8 : 0,
                      borderBottomRightRadius: tabsMenuShown ? 8 : 0,
                    }}
                  >
                    <WebView
                      injectedJavaScript={`
                        let lastSelection = null;
                        document.addEventListener("selectionchange", () => {
                          const selection = window.getSelection().toString();
                          const text = selection.length > 0 ? selection : null;
                          if (text !== lastSelection) {
                            lastSelection = text;
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: "selectedtext",
                              text
                            }));
                          }
                        });
                        true;
                      `}
                      ref={webviewRef}
                      onMessage={({ nativeEvent }) => {
                        const data = JSON.parse(nativeEvent.data);
                        console.log(data);
                        if (data.type && data.type === "selectedtext") {
                          setSelectedText(data.text || null);
                        }
                      }}
                      source={{ uri: tab.url }}
                      scrollEnabled={!tabsMenuShown}
                      nestedScrollEnabled={!tabsMenuShown}
                      onNavigationStateChange={async (navState) => {
                        if (tab.id === selectedTabId) {
                          setInput(navState.url);
                          setTabs((prevTabs) => {
                            const updated = prevTabs.map((t) =>
                              t.id === tab.id ? { ...t, url: navState.url } : t
                            );
                            if (!firebase.auth?.currentUser) {
                              setGuestTabsToStorage(updated);
                            } else {
                              firebase.createHistory(
                                tab.url,
                                firebase.auth.currentUser.email
                              );
                            }
                            return updated;
                          });
                        }
                      }}
                    />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
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
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
