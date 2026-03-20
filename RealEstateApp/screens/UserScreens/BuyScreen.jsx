import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllProperties } from "../../api/api";
import { Ionicons } from "@expo/vector-icons";
import socket from "../../socket/socket";
import { scale, verticalScale } from "../../utils/responsive";

export default function BuyScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();

    // 🎧 Socket Listeners
    socket.on("propertyAdded", (newProp) => {
      setProperties((prev) => [newProp, ...prev]);
    });

    socket.on("propertyUpdated", (updatedProp) => {
      setProperties((prev) => 
        prev.map((p) => (p._id === updatedProp._id ? updatedProp : p))
      );
    });

    socket.on("propertyDeleted", (propertyId) => {
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
    });

    return () => {
      socket.off("propertyAdded");
      socket.off("propertyUpdated");
      socket.off("propertyDeleted");
    };
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await getAllProperties();
      // Filter for 'buy' sellType if needed, or show all for now
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderProperty = ({ item }) => {
    const imageUri =
      item.images && item.images.length > 0 && item.images[0]
        ? item.images[0]
        : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("PropertyDetailsScreen", { property: item })}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Ionicons name="image-outline" size={scale(40)} color="#94a3b8" />
            <Text style={{ color: "#94a3b8", fontSize: scale(12), marginTop: verticalScale(4) }}>No Image</Text>
          </View>
        )}
        <View style={styles.details}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={scale(14)} /> {item.location || "No location"}
          </Text>
          <View style={styles.row}>
            <Text style={styles.price}>${item.price}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D5FAD" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={renderProperty}
        contentContainerStyle={{ padding: scale(16) }}
        ListEmptyComponent={<Text style={styles.empty}>No properties found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: scale(12),
    marginBottom: verticalScale(16),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: verticalScale(180),
    backgroundColor: "#e2e8f0",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    padding: scale(12),
  },
  title: { fontSize: scale(18), fontWeight: "bold", color: "#1e293b" },
  location: { fontSize: scale(14), color: "#64748b", marginVertical: verticalScale(4) },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: verticalScale(8) },
  price: { fontSize: scale(16), fontWeight: "bold", color: "#1D5FAD" },
  category: { fontSize: scale(12), color: "#1D5FAD", backgroundColor: "#eff6ff", paddingHorizontal: scale(8), paddingVertical: verticalScale(2), borderRadius: scale(4) },
  empty: { textAlign: "center", marginTop: verticalScale(40), color: "#64748b" },
});
