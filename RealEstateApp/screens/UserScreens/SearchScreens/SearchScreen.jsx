import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { scale, verticalScale } from "../../../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";


export default function SearchScreen({ navigation, route }) {

  const [searchQuery, setSearchQuery] = useState("");

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedProperties, setSavedProperties] = useState([]);
  const [likedProperties, setLikedProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (route?.params?.query) {
      setSearchQuery(route.params.query);
    }
    if (route?.params?.filters) {
      handleSearch(searchQuery, route.params.filters);
    }
  }, [route?.params?.query, route?.params?.filters]);

  useFocusEffect(
    useCallback(() => {
      loadLikedProperties();
    }, [])
  );

  useEffect(() => {
    handleSearch(searchQuery, route?.params?.filters);
  }, [searchQuery, properties, route?.params?.filters]);

  const loadLikedProperties = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem("favoriteProperties");
      if (storedFavs) {
        setLikedProperties(JSON.parse(storedFavs));
      } else {
        setLikedProperties([]);
      }
    } catch (error) {
      console.error("Error loading linked properties:", error);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await axios.get(`${API_BASE}/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const propsWithImage = res.data.map((p) => ({
        ...p,
        images:
          p.images && p.images.length > 0
            ? p.images.filter((img) => img && typeof img === "string" && img.startsWith("http"))
            : [],
      }));

      setProperties(propsWithImage);
      setFilteredProperties(propsWithImage);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.replace("Login");
  };

  const toggleSaveProperty = (id) => {
    if (savedProperties.includes(id)) {
      setSavedProperties(savedProperties.filter((propId) => propId !== id));
    } else {
      setSavedProperties([...savedProperties, id]);
    }
  };

  const toggleLikeProperty = async (id) => {
    try {
      const storedFavs = await AsyncStorage.getItem("favoriteProperties");
      let favsArray = storedFavs ? JSON.parse(storedFavs) : [];

      if (favsArray.includes(id)) {
        favsArray = favsArray.filter((propId) => propId !== id);
      } else {
        favsArray.push(id);
      }

      await AsyncStorage.setItem("favoriteProperties", JSON.stringify(favsArray));
      setLikedProperties(favsArray);
    } catch (error) {
      console.error("Error toggling like property:", error);
    }
  };


  const handleSearch = (text, filters) => {
    let filtered = properties;

    // Apply text search
    if (text) {
      const query = text.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query)) ||
          (p.location && p.location.toLowerCase().includes(query))
      );
    }

    // Apply advanced filters
    if (filters) {
      const { propertyType, minPrice, maxPrice, location } = filters;
      const searchLoc = (location || "").trim().toLowerCase();

      filtered = filtered.filter((p) => {
        // Category/Property Type check
        const pCat = (p.category || "").toLowerCase();
        const typeMatch = !propertyType || propertyType === "All" || pCat.includes(propertyType.toLowerCase()) || pCat === propertyType.toLowerCase();

        // Price check
        let pPrice = p.price;
        if (typeof pPrice === 'string') {
          pPrice = parseFloat(pPrice.replace(/[$,\s]/g, ''));
        }
        const minMatch = minPrice === undefined || pPrice >= minPrice;
        const maxMatch = maxPrice === undefined || pPrice <= maxPrice;

        // Location check
        const locMatch = !searchLoc || (p.location && p.location.toLowerCase().includes(searchLoc));

        return typeMatch && minMatch && maxMatch && locMatch;
      });
    }

    setFilteredProperties(filtered);
  };

  const renderPropertyItem = ({ item: prop }) => {
    const isSaved = savedProperties.includes(prop._id);
    const isLiked = likedProperties.includes(prop._id);

    return (
      <TouchableOpacity
        key={prop._id}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("PropertyDetailsScreen", { property: prop })}
        style={[
          styles.propertyCard,
          { borderRadius: scale(15), marginBottom: verticalScale(20) },
        ]}
      >
        <View style={[styles.imageContainer, { height: verticalScale(220) }]}>
          {prop.images && prop.images.length > 0 ? (
            <Image
              source={{ uri: prop.images[0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.propertyImage, styles.noImagePlaceholder]}>
              <Text style={{ color: "#9CA3AF", fontSize: scale(14) }}>No Image</Text>
            </View>
          )}

          {/* Floating Like Icon */}
          <TouchableOpacity
            style={[
              styles.heartIconContainer,
              {
                top: scale(12),
                right: scale(12),
                width: scale(36),
                height: scale(36),
                borderRadius: scale(18),
              },
            ]}
            onPress={() => toggleLikeProperty(prop._id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={scale(20)}
              color={isLiked ? "#EF4444" : "#4B5563"}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.cardContent, { padding: scale(15) }]}>
          <Text style={[styles.propertyTitle, { fontSize: scale(18) }]} numberOfLines={1}>
            {prop.title || "Modern Villa in Beverly Hills"}
          </Text>

          <Text style={[styles.locationText, { fontSize: scale(14), marginTop: verticalScale(4) }]}>
            {prop.location || "Beverly Hills, CA"}
          </Text>

          <View style={[styles.specsRow, { marginTop: verticalScale(12) }]}>
            <Text style={[styles.specText, { fontSize: scale(14) }]}>
              {prop.bedrooms || "5"} Beds
            </Text>
            <Text style={[styles.specDot, { fontSize: scale(14) }]}> • </Text>
            <Text style={[styles.specText, { fontSize: scale(14) }]}>
              {prop.bathrooms || "4"} Baths
            </Text>
            <Text style={[styles.specDot, { fontSize: scale(14) }]}> • </Text>
            <Text style={[styles.specText, { fontSize: scale(14) }]}>
              {prop.area || "4,500"} sqft
            </Text>
          </View>

          <Text style={[styles.priceText, { fontSize: scale(20), marginTop: verticalScale(12) }]}>
            {prop.price && typeof prop.price === "string" ? (prop.price.startsWith("$ ") ? prop.price : `$ ${prop.price}`) : `$ ${prop.price || "0"}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />


      {/* Top Bar - Unified Search & Filter */}
      <View style={[styles.topBar, { paddingHorizontal: scale(20), paddingTop: verticalScale(10), paddingBottom: verticalScale(10) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={scale(24)} color="#000" />
        </TouchableOpacity>

        <View style={[styles.searchRow, { flex: 1, marginHorizontal: scale(10) }]}>
          <View
            style={[
              styles.searchContainer,
              {
                height: verticalScale(45),
                borderRadius: scale(12),
                paddingHorizontal: scale(15),
              },
            ]}
          >
            <Feather
              name="search"
              size={scale(20)}
              color="#1D5FAD"
              style={{ marginRight: scale(5) }}
            />
            <TextInput
              style={[styles.searchInput, { fontSize: scale(15) }]}
              placeholder="Search Properties..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                width: verticalScale(45),
                height: verticalScale(45),
                marginLeft: scale(10),
                borderRadius: scale(12),
              },
            ]}
            onPress={() => navigation.navigate("SearchFilterScreen", { returnTo: "SearchScreen" })}
          >
            <Ionicons
              name="options-outline"
              size={scale(22)}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Feather name="bell" size={scale(24)} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={filteredProperties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingTop: verticalScale(10),
          paddingBottom: verticalScale(30),
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingVertical: verticalScale(15) }}>
            <Text style={[styles.resultsFound, { fontSize: scale(14) }]}>
              Found {filteredProperties.length} properties
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="search" size={scale(50)} color="#E5E7EB" />
            <Text style={[styles.emptyText, { fontSize: scale(16), marginTop: verticalScale(10) }]}>
              No properties found
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchProperties}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#1D5FAD",
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    color: "#1E293B",
    paddingVertical: 0,
  },
  propertyCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageContainer: {
    width: "100%",
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  noImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  heartIconContainer: {
    position: "absolute",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    backgroundColor: "#FFF",
  },
  propertyTitle: {
    fontWeight: "bold",
    color: "#0F172A",
  },
  locationText: {
    color: "#64748B",
  },
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  specText: {
    color: "#475569",
    fontWeight: "500",
  },
  specDot: {
    color: "#94A3B8",
  },
  priceText: {
    fontWeight: "bold",
    color: "#2563EB",
  },
  resultsFound: {
    color: "#475569",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
