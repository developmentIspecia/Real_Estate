// navigation/UserStack.jsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserDashboardScreen from "../screens/UserDashboardScreen";
import BuyScreen from "../screens/UserScreens/BuyScreen";
import RentScreen from "../screens/UserScreens/RentScreen";
import NewProjectScreen from "../screens/UserScreens/NewProjectScreen";
import SavedScreen from "../screens/UserScreens/SavedScreen";
import SettingsScreen from "../screens/UserScreens/SettingsScreen";
import ChangePassword from "../screens/UserScreens/Setting/ChangePassword";
import PersonalDetails from "../screens/UserScreens/Setting/PersonalDetails";
import LawsScreen from "../screens/UserScreens/LawsScreen";
import ServicesScreen from "../screens/UserScreens/NavScreens/ServicesScreen";
import CareersScreen from "../screens/UserScreens/NavScreens/CareersScreen";
import HelpScreen from "../screens/UserScreens/HelpScreen";
import ContactScreen from "../screens/UserScreens/NavScreens/ContactScreen";
import HomeScreen from "../screens/UserScreens/NavScreens/HomeScreen";
import ChatScreen from "../screens/UserScreens/ChatScreen";
import ShareScreen from "../screens/UserScreens/ShareScreen";
import UploadPropertyScreen from "../screens/AdminScreens/UploadPropertyScreen";
import EditPropertyScreen from "../screens/AdminScreens/EditPropertyScreen";
import SearchScreen from "../screens/UserScreens/SearchScreens/SearchScreen";
import SearchFilterScreen from "../screens/UserScreens/SearchScreens/SearchFilterScreen";
import PropertyDetailsScreen from "../screens/PropertyDetailsScreen";
import NotificationScreen from "../screens/UserScreens/Notification/NotificationScreen";
import EditProfileScreen from "../screens/UserScreens/EditProfile/EditProfileScreen";
import ContactAdminScreen from "../screens/UserScreens/ContactAdim/ContactAdminScreen";

import ProfileScreen from "../screens/UserScreens/NavScreens/ProfileScreen";
import AdminActionsScreen from "../screens/AdminScreens/AdminActions/AdminActionsScreen";
import AdminChatScreen from "../screens/AdminScreens/ChatScreen";
import CustomerScreen from "../screens/AdminScreens/CustomerScreen";
import AgentScreen from "../screens/AdminScreens/AgentScreen";

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main dashboard */}
      <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />

      {/* Property screens */}
      <Stack.Screen name="BuyScreen" component={BuyScreen} />
      <Stack.Screen name="RentScreen" component={RentScreen} />
      <Stack.Screen name="NewProjectScreen" component={NewProjectScreen} />
      <Stack.Screen name="SavedScreen" component={SavedScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="LawsScreen" component={LawsScreen} />
      <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
      <Stack.Screen name="CareersScreen" component={CareersScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      <Stack.Screen name="ContactScreen" component={ContactScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ShareScreen" component={ShareScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="SearchFilterScreen" component={SearchFilterScreen} />
      <Stack.Screen name="PropertyDetailsScreen" component={PropertyDetailsScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="AdminActionsScreen" component={AdminActionsScreen} />
      <Stack.Screen name="ContactAdminScreen" component={ContactAdminScreen} />
      <Stack.Screen name="AdminChatScreen" component={AdminChatScreen} />
      <Stack.Screen name="UploadProperty" component={UploadPropertyScreen} />
      <Stack.Screen name="EditProperty" component={EditPropertyScreen} />
      <Stack.Screen name="CustomerScreen" component={CustomerScreen} />
      <Stack.Screen name="AgentScreen" component={AgentScreen} />


      {/* Settings screens */}
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
    </Stack.Navigator>
  );
}
