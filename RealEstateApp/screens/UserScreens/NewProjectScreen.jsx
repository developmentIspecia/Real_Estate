import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { scale, verticalScale } from "../../utils/responsive";

export default function NewProjectScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>New Projects</Text>
        <Text style={styles.subtitle}>
          Explore the latest real estate projects in your area.
        </Text>

        {/* Example Project Cards */}
        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>Sunrise Heights</Text>
          <Text style={styles.projectLocation}>Mumbai, Maharashtra</Text>
          <Text style={styles.projectDesc}>
            A luxurious new residential project with 2 & 3 BHK apartments.
          </Text>
        </View>

        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>Green Valley Residency</Text>
          <Text style={styles.projectLocation}>Pune, Maharashtra</Text>
          <Text style={styles.projectDesc}>
            Affordable homes surrounded by lush greenery and modern amenities.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    padding: scale(20),
    paddingBottom: verticalScale(40),
  },
  title: {
    fontSize: scale(28),
    fontWeight: "700",
    color: "#222",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
  },
  subtitle: {
    fontSize: scale(16),
    color: "#666",
    textAlign: "center",
    marginBottom: verticalScale(25),
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: scale(12),
    padding: scale(15),
    width: "100%",
    marginBottom: verticalScale(15),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowRadius: scale(5),
    elevation: 3,
  },
  projectTitle: {
    fontSize: scale(20),
    fontWeight: "700",
    color: "#1D5FAD", // Consistent color
  },
  projectLocation: {
    fontSize: scale(14),
    color: "#888",
    marginBottom: verticalScale(5),
  },
  projectDesc: {
    fontSize: scale(15),
    color: "#444",
  },
  button: {
    backgroundColor: "#1D5FAD",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(30),
    borderRadius: scale(10),
    marginTop: verticalScale(20),
  },
  buttonText: {
    color: "#fff",
    fontSize: scale(16),
    fontWeight: "600",
  },
});
