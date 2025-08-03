import { useAppTheme } from "@/utils/theme-context";
import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, Text } from "react-native";

const FaviconOrFallback = ({ url }: { url: string | undefined }) => {
  const { theme } = useAppTheme();
  const [faviconExists, setFaviconExists] = useState<boolean | null>(null);
  const [hostname, setHostname] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    const parsedHostname = new URL(url).hostname;
    const faviconUrl = `https://${parsedHostname}/favicon.ico`;

    fetch(faviconUrl, { method: "HEAD" }) // check if it exists
      .then((res) => {
        if (res.ok) {
          setFaviconExists(true);
          setHostname(parsedHostname);
        } else {
          setFaviconExists(false);
        }
      })
      .catch(() => setFaviconExists(false));
  }, [url]);

  if (!url || faviconExists === false) {
    return (
      <Text
        style={{
          color: theme.colors.onSurface,
        }}
      >
        <AntDesign name="earth" color={theme.colors.onSurface} size={20} />
      </Text>
    );
  }

  if (faviconExists && hostname) {
    return (
      <Image
        source={{ uri: `https://${hostname}/favicon.ico` }}
        style={{ width: 20, height: 20, borderRadius: 3 }}
      />
    );
  }

  return null;
};

export default FaviconOrFallback;
