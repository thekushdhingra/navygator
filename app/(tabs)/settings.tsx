import { Entypo, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
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
      contentContainerStyle={{
        paddingBottom: 400,
      }}
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
      <CookieButton />
    </ScrollView>
  );
}

function CookieButton() {
  const [clicked, setClicked] = useState<boolean>(false);
  const { theme } = useAppTheme();
  return (
    <View
      style={{
        display: "flex",
        flex: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {clicked ? (
        <View>
          <Pressable
            style={{
              backgroundColor: theme.colors.background,
              flex: 0,
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
              }}
              onPress={() => {
                setClicked(false);
              }}
            >
              No
            </Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: theme.colors.text,
              flex: 0,
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: theme.colors.background,
              }}
            >
              Yes
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={{
            backgroundColor: theme.colors.text,
            flex: 0,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: theme.colors.background,
            }}
            onPress={() => {
              setClicked(true);
            }}
          >
            <Entypo name="database" color={theme.colors.background} size={20} />{" "}
            Clear Website Data
          </Text>
        </Pressable>
      )}
    </View>
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
      </View>
    </View>
  );
}
