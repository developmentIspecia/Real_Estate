// screens/UserScreens/UserListScreen.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { scale, verticalScale } from "../../utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { fetchAllUsers } from "../../api/api";

export default function UserListScreen({ navigation, isTab = false }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return navigation.replace("Login");

        const res = await fetchAllUsers(token);
        setUsers(res); // expects [{ _id, name, email }]
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1D5FAD" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {isTab && (
        <View style={styles.tabHeader}>
          <Text style={styles.tabHeaderTitle}>Registered Users</Text>
        </View>
      )}

      {users.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.avatarCircle}>
                {item.profilePhoto ? (
                  <Image source={{ uri: item.profilePhoto }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitial}>{item.name[0].toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(20)} color="#CBD5E1" />
            </View>
          )}
          contentContainerStyle={{ padding: scale(20), paddingBottom: verticalScale(100) }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!isTab && (
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabHeader: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tabHeaderTitle: {
    fontSize: scale(22),
    fontWeight: "bold",
    color: "#1E293B",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: scale(15),
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: scale(10),
    shadowOffset: { width: 0, height: verticalScale(4) },
    elevation: 3,
  },
  avatarCircle: {
    width: scale(45),
    height: scale(45),
    borderRadius: scale(22.5),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarInitial: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#64748B",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: scale(22.5),
  },
  userInfo: {
    flex: 1,
    marginLeft: scale(15),
  },
  name: { fontWeight: "bold", fontSize: scale(16), color: "#1E293B" },
  email: { fontSize: scale(13), color: "#64748B", marginTop: verticalScale(2) },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: scale(16),
  },
  bottom: {
    position: "absolute",
    bottom: verticalScale(20),
    left: 0,
    right: 0,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#1D5FAD",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(30),
    borderRadius: scale(25),
  },
  backText: { color: "#fff", fontWeight: "bold", fontSize: scale(16) },
});
