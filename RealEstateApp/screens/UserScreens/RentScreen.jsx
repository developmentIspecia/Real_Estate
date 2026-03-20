import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { scale, verticalScale } from "../../utils/responsive";

export default function RentScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rent Properties</Text>
        <Text style={styles.subtitle}>
          Browse properties available for rent in your area.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: scale(20),
  },
  title: {
    fontSize: scale(26),
    fontWeight: "700",
    color: "#333",
    marginBottom: verticalScale(10),
  },
  subtitle: {
    fontSize: scale(16),
    color: "#666",
    textAlign: "center",
    marginBottom: verticalScale(30),
  },
  button: {
    backgroundColor: "#1D5FAD", // Keeping colors consistent with the app theme
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(30),
    borderRadius: scale(10),
  },
  buttonText: {
    color: "#fff",
    fontSize: scale(16),
    fontWeight: "600",
  },
});
