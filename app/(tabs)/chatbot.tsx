import { auth, ChatData, chatwithAI, getChats } from "@/utils/firebaseHandler";
import { useAppTheme } from "@/utils/theme-context";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "@ronradtke/react-native-markdown-display";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatBot() {
  const params = useLocalSearchParams<{ chatID: string }>();
  const [chat, setChat] = useState<ChatData | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [thinking, setThinking] = useState<boolean>(false);
  const [windowDims, setWindowDims] = useState<{
    width: number;
    height: number;
  }>({
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
  });
  const router = useRouter();
  const { theme } = useAppTheme();
  async function chatHandeler() {
    const chatID = params.chatID;
    if (chatID) {
      setChat((await getChats(chatID)) || null);
    } else {
      alert("No Chat Found with this ID");
      router.replace("/");
    }
  }
  useEffect(() => {
    const dims = Dimensions.get("screen");
    setWindowDims({ width: dims.width, height: dims.height });
    Dimensions.addEventListener("change", () => {
      const dims = Dimensions.get("screen");
      setWindowDims({ width: dims.width, height: dims.height });
    });
  }, []);
  async function onPrompt() {
    if (currentPrompt.length !== 0) {
      setCurrentPrompt("");
      setThinking(true);
      await chatwithAI(currentPrompt, auth.currentUser.email, params.chatID);
      await chatHandeler();
      setThinking(false);
    }
  }
  useEffect(() => {
    chatHandeler();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
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
        contentContainerStyle={{
          flex: 0,
          display: "flex",
          justifyContent: "flex-start",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        {chat &&
          chat.messages.map((msg) => {
            return (
              <View key={msg.createdAt.toString()}>
                <View
                  style={{
                    display: "flex",
                    width: windowDims.width,
                    height: "auto",
                    alignItems: "flex-end",
                    paddingRight: "2%",
                  }}
                >
                  <Text
                    style={{
                      backgroundColor: theme.colors.text,
                      color: theme.colors.background,
                      textAlign: "center",
                      padding: "6%",
                      fontSize: 17,
                      maxWidth: windowDims.width / 2,
                      borderRadius: 10,
                    }}
                  >
                    {msg.prompt}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    width: windowDims.width,
                  }}
                >
                  <Markdown
                    style={{
                      body: {
                        color: theme.colors.text,
                        padding: 20,
                        fontSize: 15,
                      },
                      code_block: {
                        backgroundColor: theme.colors.surface,
                      },
                      fence: {
                        backgroundColor: theme.colors.surface,
                        borderColor: "#0000",
                        borderRadius: 20,
                      },
                      code_inline: {
                        backgroundColor: theme.colors.surface,
                      },
                    }}
                  >
                    {msg.response}
                  </Markdown>
                </View>
              </View>
            );
          })}
      </ScrollView>
      <View
        style={{
          width: "100%",
          paddingBottom: 35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: 20,
            flex: 0,
            borderRadius: 20,
            width: "90%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: theme.colors.surface,
          }}
        >
          <TextInput
            placeholder="Enter a prompt"
            placeholderTextColor={theme.colors.onSurface}
            onChangeText={setCurrentPrompt}
            value={currentPrompt}
            style={{
              color: theme.colors.text,
              width: "80%",
              borderRadius: 20,
            }}
          />
          <Pressable
            style={{
              backgroundColor:
                currentPrompt.length === 0
                  ? theme.colors.surfaceVariant
                  : theme.colors.text,
              aspectRatio: 1 / 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: 1,
              borderRadius: 2000,
            }}
            disabled={currentPrompt.length === 0 && thinking}
            onPress={() => {
              onPrompt();
            }}
          >
            <Ionicons
              name={thinking ? "square" : "arrow-up"}
              size={20}
              color={theme.colors.background}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
