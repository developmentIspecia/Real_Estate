// screens/UserScreens/SavedScreen.jsx
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

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
    <View style={styles.container}>
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
        />
      )}

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007bff",
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },
  removeBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 15,
    backgroundColor: "#ff5252",
    borderRadius: 6,
  },
  removeText: {
    color: "#fff",
    fontWeight: "600",
  },
  backBtn: {
    alignSelf: "center",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 15,
  },
  backText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
});
