import {
  ChatData,
  auth,
  chatwithAI,
  deleteChats,
  getChatsByEmail,
} from "@/utils/firebaseHandler";
import { useAppTheme } from "@/utils/theme-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatList() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [menuState, setMenuState] = useState<"main" | "chatList">("chatList");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user?.email) {
      router.replace("/");
      return;
    }

    getChatsByEmail(user.email)
      .then(setChats)
      .finally(() => setLoading(false));

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (menuState === "chatList") {
          setMenuState("main");
          return true;
        } else {
          router.replace("/");
          return true;
        }
      }
    );

    return () => backHandler.remove();
  }, [menuState, router]);

  const openChat = async (chatID: string) => {
    await AsyncStorage.setItem("openChatID", chatID);
    router.push({
      pathname: "/chatbot",
      params: {
        chatID: chatID,
      },
    });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.surface} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          position: "absolute",
          top: 40,
          left: 16,
          zIndex: 10,
        }}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        <Text style={{ marginLeft: 8, fontSize: 16, color: theme.colors.text }}>
          Back
        </Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ paddingTop: 100, paddingHorizontal: 20 }}
      >
        {menuState === "main" ? (
          <TouchableOpacity
            onPress={() => setMenuState("chatList")}
            style={{
              padding: 16,
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
              View Your Chats
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 16,
                color: theme.colors.text,
              }}
            >
              Chat History
            </Text>
            <View
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Pressable
                onPress={() => {
                  chatwithAI("hello", auth.currentUser.email).then((data) => {
                    openChat(data.id);
                  });
                }}
                style={{
                  backgroundColor: theme.colors.text,
                  display: "flex",
                  flexDirection: "row",
                  padding: 8,
                  borderRadius: 5000,
                  flex: 0,
                  marginVertical: 20,
                }}
              >
                <Ionicons
                  name="add-outline"
                  size={20}
                  color={theme.colors.background}
                />
                <Text
                  style={{
                    color: theme.colors.background,
                  }}
                >
                  Create Chat
                </Text>
              </Pressable>
            </View>

            {chats.length === 0 ? (
              <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>
                No chats found.
              </Text>
            ) : (
              chats.map((chat) => (
                <View
                  key={chat.id}
                  style={{
                    padding: 16,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: theme.colors.surface,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <Pressable
                    onPress={() => openChat(chat.id!)}
                    style={{
                      width: "70%",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        marginTop: 4,
                        color: theme.colors.onSurface,
                        fontSize: 14,
                      }}
                    >
                      {chat.messages.at(-1)?.prompt || "No prompt"}
                    </Text>
                    <Text
                      style={{
                        color: "#777",
                      }}
                    >
                      {new Date(chat.updatedAt.toDate()).toLocaleString()}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      deleteChats(chat.id);
                      getChatsByEmail(auth.currentUser.email)
                        .then(setChats)
                        .finally(() => setLoading(false));
                    }}
                  >
                    <Ionicons
                      name="close"
                      color={theme.colors.text}
                      size={20}
                    />
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
