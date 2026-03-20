import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale } from "../../../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { getPropertiesByCategory } from "../../../api/api";

export default function HousesScreen() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await getPropertiesByCategory("houses");
        setProperties(res);
      } catch (err) {
        console.error("Error fetching houses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <Text style={[styles.loading, { fontSize: scale(16), marginTop: verticalScale(50) }]}>Loading...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={{ fontSize: scale(14) }}>Price: ₹{item.price}</Text>
            <Text style={{ fontSize: scale(14) }}>For: {item.propertyFor}</Text>
            <Text style={{ fontSize: scale(14) }}>Contact: {item.contact}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: scale(10) }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  card: { backgroundColor: "#E8F5E9", padding: scale(10), borderRadius: scale(10), marginBottom: verticalScale(10) },
  image: { width: "100%", height: verticalScale(180), borderRadius: scale(10), marginBottom: verticalScale(10) },
  title: { fontSize: scale(18), fontWeight: "bold", marginBottom: verticalScale(5) },
  loading: { textAlign: "center" },
});
