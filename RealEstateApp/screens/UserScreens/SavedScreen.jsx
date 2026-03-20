import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { scale, verticalScale } from "../../utils/responsive";

export default function SavedScreen() {
  const navigation = useNavigation();

  // Sample saved listings (you can replace this with data from your backend)
  const [savedProperties, setSavedProperties] = useState([
    {
      id: "1",
      title: "Modern Apartment in Delhi",
      location: "Connaught Place, New Delhi",
      price: "₹65 Lakh",
    },
    {
      id: "2",
      title: "3BHK Villa in Mumbai",
      location: "Bandra West, Mumbai",
      price: "₹1.2 Crore",
    },
  ]);

  const renderProperty = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.price}>{item.price}</Text>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() =>
          setSavedProperties((prev) => prev.filter((p) => p.id !== item.id))
        }
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Saved Properties</Text>

      {savedProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved properties yet.</Text>
        </View>
      ) : (
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => item.id}
          renderItem={renderProperty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: scale(20) }}
        />
      )}

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: scale(26),
    fontWeight: "700",
    color: "#222",
    marginBottom: verticalScale(20),
    textAlign: "center",
    marginTop: verticalScale(10),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: scale(10),
    padding: scale(15),
    marginBottom: verticalScale(15),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowRadius: scale(4),
    elevation: 3,
  },
  title: {
    fontSize: scale(18),
    fontWeight: "700",
    color: "#1D5FAD", // Consistent color
  },
  location: {
    fontSize: scale(14),
    color: "#666",
    marginTop: verticalScale(5),
  },
  price: {
    fontSize: scale(16),
    fontWeight: "600",
    color: "#333",
    marginTop: verticalScale(5),
  },
  removeBtn: {
    alignSelf: "flex-end",
    marginTop: verticalScale(10),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(15),
    backgroundColor: "#ff5252",
    borderRadius: scale(6),
  },
  removeText: {
    color: "#fff",
    fontWeight: "600",
  },
  backBtn: {
    alignSelf: "center",
    backgroundColor: "#1D5FAD",
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(25),
    borderRadius: scale(10),
    marginVertical: verticalScale(15),
  },
  backText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: scale(16),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: scale(16),
  },
});
