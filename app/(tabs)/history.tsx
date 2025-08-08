import {
  auth,
  deleteHistory,
  getHistory,
  History,
} from "@/utils/firebaseHandler";
import { useAppTheme } from "@/utils/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HistoryTab() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function historyHandler() {
    try {
      if (!auth.currentUser?.email) {
        console.error("No authenticated user or email found");
        setHistory([]);
        return;
      }
      const historyData = await getHistory(auth.currentUser.email);
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }
  const removeByEmailAndUrl = (emailToRemove: string, urlToRemove: string) => {
    setHistory((prev) =>
      prev.filter(
        (entry) => !(entry.email === emailToRemove && entry.url === urlToRemove)
      )
    );
  };

  async function deleteHistoryHandler(entry: History) {
    removeByEmailAndUrl(entry.email, entry.url);
    await deleteHistory(entry.email, entry.url);
    await historyHandler();
  }

  useEffect(() => {
    historyHandler();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: "center",
        padding: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          position: "absolute",
          top: 40,
          left: 16,
        }}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        <Text style={{ marginLeft: 8, fontSize: 16, color: theme.colors.text }}>
          Back
        </Text>
      </TouchableOpacity>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 60,
          marginTop: 40,
          fontWeight: 700,
        }}
      >
        History
      </Text>
      {loading ? (
        <Text
          style={{
            color: theme.colors.text,
          }}
        >
          Loading...
        </Text>
      ) : history && history.length > 0 ? (
        <ScrollView
          style={{
            flex: 1,
            flexDirection: "column",
          }}
        >
          {history.map((entry, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                padding: 20,
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Ionicons
                size={25}
                name="globe-outline"
                color={theme.colors.text}
              />
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {entry.url.slice(0, 40)}
              </Text>
              <Pressable
                onPress={() => {
                  deleteHistoryHandler(entry);
                }}
              >
                <Ionicons name="close" size={25} color={theme.colors.text} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text
          style={{
            color: theme.colors.text,
          }}
        >
          No history available
        </Text>
      )}
    </View>
  );
}
