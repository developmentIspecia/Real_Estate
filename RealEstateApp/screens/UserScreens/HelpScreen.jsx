import React from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const scale = (size) => (width / 375) * size;

  return (
    <LinearGradient
      colors={["#FFF3E0", "#FFD54F", "#FFF9C4"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3E0" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={scale(24)} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>We're here to assist you!</Text>

          <View style={styles.section}>
            <Text style={styles.heading}>How to Buy Property</Text>
            <Text style={styles.text}>
              Browse listings, view property details, and contact the seller
              directly through our app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>How to Sell Property</Text>
            <Text style={styles.text}>
              Go to your profile, select "List Property," and fill in all details
              like price, photos, and location.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Need More Help?</Text>
            <Text style={styles.text}>
              Contact our support team via email or phone. We’ll get back to you
              as soon as possible.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  topBar: {
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
  },
  backButton: {
    padding: 5,
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 12,
    padding: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
});

export default HelpScreen;