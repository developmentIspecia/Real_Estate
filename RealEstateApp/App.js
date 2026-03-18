// App.js - Diagnostic Update
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Screens
import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import SignupScreen from "./screens/SignupScreen";
import OTPVerificationScreen from "./screens/OTPVerificationScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";

// Stacks
import UserStack from "./navigation/UserStack";
import AdminStack from "./navigation/AdminStack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          {/* Splash / Auth Screens */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
          <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />

          {/* Main App Screens */}
          <Stack.Screen name="UserStack" component={UserStack} />
          <Stack.Screen name="AdminStack" component={AdminStack} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}