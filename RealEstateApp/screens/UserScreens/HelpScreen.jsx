import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { scale, verticalScale } from "../../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpScreen = ({ navigation }) => {

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
    padding: scale(20),
    paddingTop: verticalScale(10),
  },
  topBar: {
    paddingHorizontal: scale(20),
    height: verticalScale(50),
    justifyContent: 'center',
  },
  backButton: {
    padding: scale(5),
    width: scale(40),
  },
  title: {
    fontSize: scale(28),
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: verticalScale(10),
  },
  subtitle: {
    fontSize: scale(16),
    color: "#555",
    textAlign: "center",
    marginBottom: verticalScale(30),
  },
  section: {
    marginBottom: verticalScale(25),
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: scale(12),
    padding: scale(15),
  },
  heading: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#444",
    marginBottom: verticalScale(8),
  },
  text: {
    fontSize: scale(15),
    color: "#555",
    lineHeight: verticalScale(22),
  },
});

export default HelpScreen;