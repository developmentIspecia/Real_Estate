import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { scale, verticalScale } from "../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("WelcomeScreen");
    }, 3000); // 3 seconds delay
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Image
          source={require("../assets/logo.png")} // your logo on top
          style={[styles.logo, { width: scale(150), height: scale(150), marginBottom: verticalScale(20) }]}
          resizeMode="contain"
        />
        <Text style={[styles.companyName, { fontSize: scale(24), marginTop: verticalScale(10) }]}>Real Estate</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    // scaled via inline style
  },
  companyName: {
    fontWeight: "600",
    color: "#000000",
    // scaled via inline style
  },
});
