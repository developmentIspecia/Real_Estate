// screens/UserScreens/NewProjectScreen.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function NewProjectScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginTop: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007bff",
  },
  projectLocation: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  projectDesc: {
    fontSize: 15,
    color: "#444",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
