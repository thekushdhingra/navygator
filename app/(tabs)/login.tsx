import { auth } from "@/utils/firebaseHandler";
import { useAppTheme } from "@/utils/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthForm() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [mode, setMode] = useState<"login" | "register" | "pass">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 24,
      justifyContent: "center",
    },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      position: "absolute",
      top: 40,
      left: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 24,
      alignSelf: "center",
    },
    input: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderBottomColor: theme.colors.text,
      borderBottomWidth: 2,
      margin: 12,
      marginBottom: 16,
    },
    inputWrapper: {
      position: "relative",
      marginBottom: 16,
    },
    eyeIcon: {
      position: "absolute",
      right: 12,
      top: 14,
    },
    button: {
      backgroundColor: theme.colors.text,
      padding: 14,
      alignItems: "center",
      marginBottom: 12,
      borderRadius: 30,
    },
    buttonText: {
      color: theme.colors.background,
      fontWeight: "bold",
      fontSize: 16,
    },
    switchText: {
      color: theme.colors.accent,
      textAlign: "center",
      marginTop: 8,
      textDecorationLine: "underline",
    },
  });
  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      alert("Error Sending Password Email: " + e);
    }
  };
  const handleAuth = async () => {
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace("/");
      } else {
        if (password !== confirm) {
          Alert.alert("Passwords do not match");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        router.replace("/");
      }
    } catch (e: any) {
      Alert.alert("Authentication Error", e.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        <Text style={{ marginLeft: 8, fontSize: 16, color: theme.colors.text }}>
          Back
        </Text>
      </TouchableOpacity>
      <Text style={styles.title}>
        {mode === "pass"
          ? "Reset Password"
          : mode === "login"
          ? "Login"
          : "Register"}
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.colors.text + "99"}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {mode !== "pass" && (
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={theme.colors.text + "99"}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={10}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      )}
      {mode === "register" && (
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor={theme.colors.text + "99"}
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirm((v) => !v)}
            hitSlop={10}
          >
            <Ionicons
              name={showConfirm ? "eye-off" : "eye"}
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={
          loading
            ? { filter: "brightness(50%)", ...styles.button }
            : styles.button
        }
        onPress={() => {
          if (mode === "pass") {
            handlePasswordReset();
          } else {
            handleAuth();
          }
        }}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {mode === "login"
            ? "Login"
            : mode === "register"
            ? "Register"
            : "Reset Password"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setMode(mode === "login" ? "register" : "login")}
      >
        <Text style={styles.switchText}>
          {mode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
      {mode !== "pass" && (
        <TouchableOpacity
          onPress={() => {
            setMode("pass");
          }}
        >
          <Text style={styles.switchText}>Forgot your Password? Reset It!</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}
