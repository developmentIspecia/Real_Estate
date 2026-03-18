import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  useWindowDimensions,
  ScrollView, // 1. Added ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

  const scale = (size) => (width / 375) * size;
  const verticalScale = (size) => (height / 812) * size;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.overlay} />

      {/* 2. Wrapped in ScrollView to prevent bottom clipping */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.content}
        bounces={false}
      >
        <View style={{ paddingHorizontal: scale(15), paddingBottom: verticalScale(10), flex: 1 }}>

          {/* Logo Section */}
          <View style={styles.logoWrapper}>
            <View style={[styles.logoContainer, { marginTop: verticalScale(40) }]}>
              <ImageBackground
                source={require("../assets/logo.png")}
                style={{ width: scale(80), height: scale(80) }}
                imageStyle={{ borderRadius: scale(80) }}
              />
            </View>
          </View>

          <View style={[styles.spacer]} />

          {/* Middle Section */}
          <View style={styles.middleContent}>
            <ImageBackground
              source={require("../assets/main_image.png")}
              style={{
                width: scale(365),
                height: verticalScale(230),
              }}
              resizeMode="cover"
            />
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomContent}>
            <Text style={[styles.welcomeTitle, { fontSize: scale(32), marginBottom: verticalScale(15) }]}>
              Welcome!
            </Text>

            <TouchableOpacity
              style={[styles.createBtn, { paddingVertical: verticalScale(12), borderRadius: scale(10), marginBottom: verticalScale(15) }]}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={[styles.createBtnText, { fontSize: scale(16) }]}>Create an account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, { paddingVertical: verticalScale(12), marginBottom: verticalScale(20) }]}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={[styles.loginBtnText, { fontSize: scale(16) }]}>Already have an account?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestLink}
              onPress={() => navigation.replace("UserStack")}
            >
              <Text style={[styles.guestLinkText, { fontSize: scale(14) }]}>I am a guest. Skip for now.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  content: {
    flex: 1,
  },
  logoWrapper: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  middleContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  bottomContent: {
    width: "100%",
  },
  welcomeTitle: {
    fontWeight: "bold",
    color: "#1D5FAD",
    textAlign: "left",
  },
  createBtn: {
    backgroundColor: "#1D5FAD",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loginBtn: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#1D5FAD",
    borderWidth: 1, // Increased slightly for visibility
    borderStyle: "solid", // Explicitly set to solid
    borderRadius: 10,
  },
  loginBtnText: {
    color: "#1D5FAD",
    fontWeight: "bold",
  },
  guestLink: {
    alignItems: "center",
  },
  guestLinkText: {
    color: "#1D5FAD",
    fontWeight: "500",
    opacity: 0.9,
  },
});
