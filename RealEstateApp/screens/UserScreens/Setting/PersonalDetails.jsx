import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";
import { scale, verticalScale } from "../../../utils/responsive";

const PersonalDetails = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, middleName, lastName, email } = res.data;
        const fullName = [name, middleName, lastName].filter(Boolean).join(" ");

        setUserDetails({ fullName, email });
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D5FAD" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.header}>Personal Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{userDetails.fullName || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userDetails.email || "N/A"}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(16),
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: scale(12),
    padding: scale(24),
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: scale(10),
    alignItems: "flex-start",
  },
  header: {
    fontSize: scale(22),
    fontWeight: "bold",
    color: "#1D5FAD",
    marginBottom: verticalScale(20),
    alignSelf: "center",
  },
  row: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: scale(16),
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: scale(18),
    color: "#555",
    marginTop: verticalScale(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
