import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
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

  if (loading) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text>Price: ₹{item.price}</Text>
            <Text>For: {item.propertyFor}</Text>
            <Text>Contact: {item.contact}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { backgroundColor: "#E8F5E9", padding: 10, borderRadius: 10, marginBottom: 10 },
  image: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  loading: { textAlign: "center", marginTop: 50 },
});
