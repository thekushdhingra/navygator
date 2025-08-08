import FaviconOrFallback from "@/components/favicon";
import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ActivityIndicator, Menu, Provider } from "react-native-paper";
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
  saveGuestTabsToStorage,
  saveTabsToStorage,
  setGuestSelectedTabId,
  setSelectedTabId,
  Tab,
} from "../../utils/tab_utils";
import { useAppTheme } from "../../utils/theme-context";
global.Buffer = Buffer;

export default function Home() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const webviewRef = useRef<WebView>(null);
  const [tabsMenuShown, setTabsMenuShown] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTabId, setSelectedTabIdState] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBlocking, setisBlocking] = useState<boolean>(false);
  const [windowDims, setWindowDims] = useState<{
    width: number;
    height: number;
  }>({
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
  });

  const [isGuest, setIsGuest] = useState(false);

  const safeNavigate = async (path: Href) => {
    if (isGuest) {
      await saveGuestTabsToStorage(tabs);
      await setGuestSelectedTabId(selectedTabId);
    } else if (firebase.auth.currentUser?.email) {
      await saveTabsToStorage(tabs);
      await setSelectedTabId(selectedTabId);
    }
    router.push(path);
  };

  const loadTabs = useCallback(async () => {
    setIsLoading(true);
    const currentUser = await firebase.auth.authStateReady();
    const guest = currentUser === null;
    setIsGuest(guest);

    let loadedTabs: Tab[] = [];
    let selectedId: number | null = null;

    loadedTabs = guest
      ? await getGuestTabsFromStorage()
      : await getTabsFromStorage();
    selectedId = guest
      ? await getGuestSelectedTabId()
      : await getSelectedTabId();

    if (loadedTabs.length === 0) {
      const newTab = { id: Date.now(), url: "https://www.google.com" };
      if (guest) {
        await addGuestTab(newTab);
      } else {
        await addTab(newTab);
      }
      loadedTabs = [newTab];
      selectedId = newTab.id;
    }

    const selectedTab = loadedTabs.find((tab) => tab.id === selectedId);
    setTabs(loadedTabs);
    setSelectedTabIdState(selectedId);
    setInput(selectedTab?.url ?? "https://www.google.com");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTabs();
  }, [loadTabs]);

  useFocusEffect(
    useCallback(() => {
      loadTabs();
    }, [loadTabs])
  );

  useEffect(() => {
    if (tabs.length === 0) return;
    if (isGuest) {
      saveGuestTabsToStorage(tabs);
    } else if (firebase.auth.currentUser?.email) {
      tabs.forEach(async (tab, index) => {
        const history = firebase.createHistory(
          tab.url,
          firebase.auth.currentUser.email
        );
        console.log(history);
        console.log(`${index + 1}) id: ${tab.id} and url: ${tab.url}`);
      });
      saveTabsToStorage(tabs);
    }
  }, [tabs, isGuest]);

  useEffect(() => {
    const updateDims = () => {
      const dims = Dimensions.get("screen");
      setWindowDims({ width: dims.width, height: dims.height });
    };
    updateDims();
    const subscription = Dimensions.addEventListener("change", updateDims);
    return () => subscription?.remove();
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
      if (isGuest) {
        await saveGuestTabsToStorage(updatedTabs);
      } else if (firebase.auth.currentUser?.email) {
        await saveTabsToStorage(updatedTabs);
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
          <View style={{ filter: theme.dark ? "" : "invert(1)" }}>
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
            onPress={() => safeNavigate("/login")}
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
          <Pressable
            onPress={async () => {
              setIsGuest(false);
              await loadTabs();
            }}
          >
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

  return (
    <Provider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        {isBlocking && (
          <Modal transparent animationType="fade" visible>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  padding: 20,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={{
                    marginTop: 12,
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  Getting things ready for you!
                </Text>
              </View>
            </View>
          </Modal>
        )}
        <View
          style={[
            styles.navBar,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Pressable
            onPress={async () => {
              const selectedTab = tabs.find((tab) => tab.id === selectedTabId);
              if (selectedTab && selectedTabId !== null) {
                const updatedTabs = tabs.map((tab) =>
                  tab.id === selectedTabId
                    ? { ...tab, url: "https://www.google.com" }
                    : tab
                );
                setTabs(updatedTabs);
                setInput("https://www.google.com");
                if (isGuest) {
                  await saveGuestTabsToStorage(updatedTabs);
                } else if (firebase.auth.currentUser?.email) {
                  await saveTabsToStorage(updatedTabs);
                }
                webviewRef.current?.injectJavaScript(
                  `window.location.href = "https://www.google.com";`
                );
              }
            }}
          >
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
              style={{ marginHorizontal: 10 }}
              onPress={async () => {
                const newTab = {
                  id: Date.now(),
                  url: "https://www.google.com",
                };
                setTabs([...tabs, newTab]);
                setSelectedTabIdState(newTab.id);
                setInput(newTab.url);
                if (isGuest) {
                  await addGuestTab(newTab);
                } else {
                  await addTab(newTab);
                }
              }}
            >
              <Entypo name="plus" color={theme.colors.text} size={30} />
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
              style={{ marginHorizontal: 0 }}
              onPress={async () => {
                if (firebase.auth.currentUser?.email) {
                  setisBlocking(true);
                  const chat = await firebase.chatwithAI(
                    "Summarise this: " + selectedText,
                    firebase.auth.currentUser.email
                  );
                  await AsyncStorage.setItem("openChatID", chat.id);
                  router.push({
                    pathname: "/chatbot",
                    params: { chatID: chat.id },
                  });
                }
              }}
            >
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={theme.colors.text}
              />
            </Pressable>
          )}
          <Menu
            visible={menuVisible}
            theme={{
              colors: { elevation: { level2: theme.colors.background } },
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
                onPress={() => safeNavigate("/login")}
                title="Sign In"
                leadingIcon="account-plus-outline"
                titleStyle={{ color: theme.colors.text }}
              />
            )}
            {!isGuest && firebase.auth.currentUser && (
              <Menu.Item
                onPress={() => safeNavigate("/history")}
                title="History"
                leadingIcon="history"
                titleStyle={{ color: theme.colors.text }}
              />
            )}
            {!isGuest && firebase.auth.currentUser && (
              <Menu.Item
                onPress={() => safeNavigate("/chatlist")}
                title="Chat with AI"
                leadingIcon="robot"
                titleStyle={{ color: theme.colors.text }}
              />
            )}
            <Menu.Item
              onPress={() => safeNavigate("/settings")}
              title="Settings"
              titleStyle={{ color: theme.colors.text }}
              leadingIcon="cog-outline"
            />
            {firebase.auth.currentUser && (
              <Menu.Item
                title="Sign Out"
                titleStyle={{ color: theme.colors.text }}
                leadingIcon="exit-to-app"
                onPress={async () => {
                  await firebase.auth.signOut();
                  setIsGuest(true);
                  await loadTabs();
                }}
              />
            )}
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
              justifyContent: "space-between",
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
                  display:
                    tab.id === selectedTabId || tabsMenuShown ? "flex" : "none",
                }}
                onPress={async () => {
                  setSelectedTabIdState(tab.id);
                  setTabsMenuShown(false);
                  setInput(tab.url);
                  if (isGuest) {
                    await setGuestSelectedTabId(tab.id);
                  } else {
                    await setSelectedTabId(tab.id);
                  }
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
                  {tabsMenuShown && (
                    <View
                      style={{
                        flex: 0,
                        backgroundColor: theme.colors.surface,
                        width: tabsMenuShown
                          ? windowDims.width / 2.15
                          : windowDims.width,
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
                          flex: 0,
                          gap: 10,
                        }}
                      >
                        <FaviconOrFallback url={tab.url} />
                        <Text style={{ color: theme.colors.onSurface }}>
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
                        style={{
                          flex: 1,
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                        }}
                        onPress={async () => {
                          const updatedTabs = tabs.filter(
                            (t) => t.id !== tab.id
                          );
                          setTabs(updatedTabs);
                          if (updatedTabs.length > 0) {
                            setSelectedTabIdState(updatedTabs[0].id);
                            setInput(updatedTabs[0].url);
                            if (isGuest) {
                              await closeGuestTab(tab.id);
                              await setGuestSelectedTabId(updatedTabs[0].id);
                            } else {
                              await closeTab(tab.id);
                              await setSelectedTabId(updatedTabs[0].id);
                            }
                          } else {
                            setSelectedTabIdState(null);
                            setInput("https://www.google.com");
                            if (isGuest) {
                              await closeGuestTab(tab.id);
                            } else {
                              await closeTab(tab.id);
                            }
                          }
                        }}
                      >
                        <Entypo
                          name="cross"
                          size={20}
                          color={theme.colors.onSurface}
                        />
                      </Pressable>
                    </View>
                  )}
                  <View
                    style={{
                      height: windowDims.height,
                      width: tabsMenuShown
                        ? windowDims.width / 2.15
                        : windowDims.width,
                      transitionProperty: "",
                      overflow: tabsMenuShown ? "hidden" : "scroll",
                      borderBottomLeftRadius: tabsMenuShown ? 8 : 0,
                      borderBottomRightRadius: tabsMenuShown ? 8 : 0,
                    }}
                    pointerEvents={tabsMenuShown ? "none" : "auto"}
                  >
                    <WebView
                      allowsInlineMediaPlayback
                      allowsFullscreenVideo
                      allowFileAccessFromFileURLs
                      allowFileAccess
                      menuItems={[
                        {
                          label: "Summarise",
                          key: "summarise",
                        },
                      ]}
                      onCustomMenuSelection={(webviewEvent) => {
                        const { key } = webviewEvent.nativeEvent;
                        if (key === "summarise") {
                          (async () => {
                            if (firebase.auth.currentUser?.email) {
                              setisBlocking(true);
                              const chat = await firebase.chatwithAI(
                                "Summarise this: " + selectedText,
                                firebase.auth.currentUser.email
                              );
                              await AsyncStorage.setItem("openChatID", chat.id);
                              router.push({
                                pathname: "/chatbot",
                                params: { chatID: chat.id },
                              });
                            }
                          })();
                        }
                      }}
                      style={{
                        borderBottomLeftRadius: tabsMenuShown ? 8 : 0,
                        borderBottomRightRadius: tabsMenuShown ? 8 : 0,
                      }}
                      injectedJavaScript={`
  (function() {
    // ✅ Text selection tracker
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

    // ✅ Ad blocker
    const adSelectors = [
      'iframe[src*="ads"]',
      '[id^="ad-"]',
      '[class*="ad-"]',
      '[class^="ads"]',
      'script[src*="doubleclick"]',
      'script[src*="googlesyndication"]',
      'div[id*="sponsor"]',
      'div[class*="ad"]',
    ];

    function removeAds() {
      adSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    }

    const observer = new MutationObserver(removeAds);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    removeAds();
  })();
  true;
`}
                      onShouldStartLoadWithRequest={(request) => {
                        if (tab.id === selectedTabId) {
                          setTabs((prevTabs) => {
                            const updated = prevTabs.map((t) =>
                              t.id === tab.id ? { ...t, url: request.url } : t
                            );
                            if (isGuest) {
                              saveGuestTabsToStorage(updated);
                            } else if (firebase.auth.currentUser?.email) {
                              saveTabsToStorage(updated);
                            }
                            return updated;
                          });
                          setInput(request.url);
                        }
                        return true;
                      }}
                      ref={webviewRef}
                      onMessage={({ nativeEvent }) => {
                        try {
                          const data = JSON.parse(nativeEvent.data);
                          if (data.type === "selectedtext") {
                            setSelectedText(data.text || null);
                          }
                        } catch (e) {
                          console.error("Error parsing WebView message:", e);
                        }
                      }}
                      source={{ uri: tab.url }}
                      scrollEnabled={!tabsMenuShown}
                      nestedScrollEnabled={!tabsMenuShown}
                      onNavigationStateChange={(navState) => {
                        if (tab.id === selectedTabId) {
                          setInput(navState.url);
                          setTabs((prevTabs) => {
                            const updated = prevTabs.map((t) =>
                              t.id === tab.id ? { ...t, url: navState.url } : t
                            );
                            if (isGuest) {
                              saveGuestTabsToStorage(updated);
                            } else if (firebase.auth.currentUser?.email) {
                              saveTabsToStorage(updated);
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
