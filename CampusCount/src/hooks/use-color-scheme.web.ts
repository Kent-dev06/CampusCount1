import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * To support static rendering, use light mode until the client
 * determines the current color scheme.
 */
export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  return colorScheme ?? "light";
}
