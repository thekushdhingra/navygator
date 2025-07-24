import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import { useAppTheme } from "../../utils/theme-context";

export default function Settings() {
  const router = useRouter();
  const { setAccent, setCustomTheme, setTheme, accentColor, theme, mode } =
    useAppTheme();

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "custom">(mode);
  const [primaryColor, setPrimaryColor] = useState(theme.colors.primary);
  const [backgroundColor, setBackgroundColor] = useState(
    theme.colors.background
  );
  const [surfaceColor, setSurfaceColor] = useState(theme.colors.surface);
  const [textColor, setTextColor] = useState(theme.colors.text);

  const handleApplyCustomTheme = () => {
    setCustomTheme({
      primary: primaryColor,
      background: backgroundColor,
      surface: surfaceColor,
      text: textColor,
    });
    setTheme("custom");
  };

  const handleThemeChange = (selectedMode: "light" | "dark" | "custom") => {
    setThemeMode(selectedMode);
    setTheme(selectedMode);

    if (selectedMode === "custom") {
      // Pre-fill current theme colors into state
      setPrimaryColor(theme.colors.primary);
      setBackgroundColor(theme.colors.background);
      setSurfaceColor(theme.colors.surface);
      setTextColor(theme.colors.text);
      setAccent(theme.colors.accent);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 20,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        <Text
          style={{ marginLeft: 8, fontSize: 16, color: theme.colors.onSurface }}
        >
          Back
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: theme.colors.onSurface,
          marginBottom: 12,
        }}
      >
        Theme Mode
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        {["light", "dark", "custom"].map((modeOption) => (
          <TouchableOpacity
            key={modeOption}
            onPress={() => handleThemeChange(modeOption as any)}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor:
                themeMode === modeOption
                  ? theme.colors.text
                  : theme.colors.surface,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color:
                  themeMode === modeOption
                    ? theme.colors.surface
                    : theme.colors.text,
                textTransform: "capitalize",
              }}
            >
              {modeOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {themeMode === "custom" && (
        <>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: theme.colors.onSurface,
              marginBottom: 12,
            }}
          >
            Accent Color
          </Text>

          <ColorPicker
            color={accentColor}
            onColorChange={setAccent}
            thumbSize={40}
            sliderSize={40}
            noSnap
            row={false}
            useNativeDriver={false}
          />

          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: theme.colors.onSurface,
              marginTop: 30,
              marginBottom: 12,
            }}
          >
            Custom Theme Colors
          </Text>

          <View style={{ gap: 12 }}>
            <ColorInput
              label="Primary Color"
              value={primaryColor}
              onChange={setPrimaryColor}
            />
            <ColorInput
              label="Background Color"
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <ColorInput
              label="Surface Color"
              value={surfaceColor}
              onChange={setSurfaceColor}
            />
            <ColorInput
              label="Text Color"
              value={textColor}
              onChange={setTextColor}
            />
          </View>

          <TouchableOpacity
            onPress={handleApplyCustomTheme}
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: theme.colors.text,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: theme.colors.surface, textAlign: "center" }}>
              Apply Custom Theme
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <Text style={{ color: theme.colors.onSurface, marginBottom: 4 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="#rrggbb"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.colors.onSurface,
            padding: 8,
            borderRadius: 8,
            color: theme.colors.onSurface,
          }}
        />
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ marginLeft: 8 }}
        >
          <Ionicons name="color-palette" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              padding: 20,
              borderRadius: 12,
              width: "80%",
            }}
          >
            <ColorPicker
              color={value}
              onColorChange={onChange}
              thumbSize={40}
              sliderSize={40}
              noSnap
              row={false}
              useNativeDriver={false}
            />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: theme.colors.text,
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Text
                style={{ color: theme.colors.surface, textAlign: "center" }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
