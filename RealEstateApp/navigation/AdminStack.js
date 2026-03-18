// navigation/AdminStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import UserListScreen from "../screens/AdminScreens/UserListScreen";
import ChatScreen from "../screens/AdminScreens/ChatScreen";
import UploadPropertyScreen from "../screens/AdminScreens/UploadPropertyScreen";
import FlatsScreen from "../screens/AdminScreens/PropertyType/FlatsScreen";
import HousesScreen from "../screens/AdminScreens/PropertyType/HousesScreen";
import LandsScreen from "../screens/AdminScreens/PropertyType/LandsScreen";
import OthersScreen from "../screens/AdminScreens/PropertyType/OthersScreen";
import EditPropertyScreen from "../screens/AdminScreens/EditPropertyScreen";
import CustomerScreen from "../screens/AdminScreens/CustomerScreen";
import AgentScreen from "../screens/AdminScreens/AgentScreen";
// Import other admin screens here as needed, e.g., UploadProperty, PropertyListScreen

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Dashboard */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />

      {/* User List */}
      <Stack.Screen name="UserListScreen" component={UserListScreen} />

      {/* Chat Screen */}
      <Stack.Screen name="AdminChatScreen" component={ChatScreen} />

      {/* Add other admin screens here */}
      <Stack.Screen name="UploadProperty" component={UploadPropertyScreen} />
      {/* <Stack.Screen name="PropertyListScreen" component={PropertyListScreen} /> */}
      <Stack.Screen name="FlatsScreen" component={FlatsScreen} />
      <Stack.Screen name="HousesScreen" component={HousesScreen} />
      <Stack.Screen name="LandsScreen" component={LandsScreen} />
      <Stack.Screen name="OthersScreen" component={OthersScreen} />
      <Stack.Screen name="EditProperty" component={EditPropertyScreen} />
      <Stack.Screen name="CustomerScreen" component={CustomerScreen} />
      <Stack.Screen name="AgentScreen" component={AgentScreen} />
    </Stack.Navigator>
  );
}
