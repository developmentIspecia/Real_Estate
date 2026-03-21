import React, { useState, useRef, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
  TextInput,
  Animated,
  PanResponder,
} from "react-native";
import { scale, verticalScale, SCREEN_WIDTH } from "../../../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";


export default function SearchFilterScreen({ navigation, route }) {
    const [selectedPropertyType, setSelectedPropertyType] = useState("All");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 5000000 });
    const [location, setLocation] = useState("");
    const [properties, setProperties] = useState([]);
    const [filteredCount, setFilteredCount] = useState(0);

    const propertyTypes = ["All", "House", "Flat", "Land"];

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.get(`${API_BASE}/properties`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProperties(res.data);
            calculateFilteredCount(res.data, selectedPropertyType, displayMin, displayMax, location);
        } catch (err) {
            console.error("Failed to fetch properties:", err);
        }
    };

    const calculateFilteredCount = useCallback((props, type, min, max, loc) => {
        const searchLoc = (loc || "").trim().toLowerCase();
        let count = props.filter(p => {
            const pCat = (p.category || "").toLowerCase();
            const typeMatch = type === "All" || pCat.includes(type.toLowerCase()) || pCat === type.toLowerCase();
            
            // Clean price string and convert to number
            let pPrice = p.price;
            if (typeof pPrice === 'string') {
                pPrice = parseFloat(pPrice.replace(/[$,\s]/g, ''));
            }
            const priceMatch = pPrice >= min && pPrice <= max;
            
            const locMatch = !searchLoc || (p.location && p.location.toLowerCase().includes(searchLoc));

            return typeMatch && priceMatch && locMatch;
        }).length;
        setFilteredCount(count);
    }, []);

    useEffect(() => {
        calculateFilteredCount(properties, selectedPropertyType, displayMin, displayMax, location);
    }, [selectedPropertyType, displayMin, displayMax, location, properties, calculateFilteredCount]);

    // Dynamic Slider Logic
    const minPrice = 0;
    const maxPrice = 5000000;
    const sliderWidth = SCREEN_WIDTH - scale(40);
    const thumbSize = scale(20);

    const leftThumbX = useRef(new Animated.Value(0)).current;
    const rightThumbX = useRef(new Animated.Value(sliderWidth)).current;

    const [displayMin, setDisplayMin] = useState(0);
    const [displayMax, setDisplayMax] = useState(5000000);

    // Track which thumb is currently being moved
    const activeThumb = useRef(null); // 'left' or 'right'

    const sliderPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const touchX = evt.nativeEvent.locationX;
                const leftX = leftThumbX._value;
                const rightX = rightThumbX._value;

                // Determine which thumb is closer to the touch
                if (Math.abs(touchX - leftX) < Math.abs(touchX - rightX)) {
                    activeThumb.current = 'left';
                } else {
                    activeThumb.current = 'right';
                }

                // Allow "tap-to-set" by moving the thumb immediately
                updateThumbPosition(touchX);
            },
            onPanResponderMove: (evt) => {
                updateThumbPosition(evt.nativeEvent.locationX);
            },
            onPanResponderRelease: () => {
                activeThumb.current = null;
                const min = Math.round(minPrice + (maxPrice - minPrice) * (leftThumbX._value / sliderWidth));
                const max = Math.round(minPrice + (maxPrice - minPrice) * (rightThumbX._value / sliderWidth));
                setPriceRange({ min, max });
            }
        })
    ).current;

    const updateThumbPosition = (touchX) => {
        let newX = touchX;
        if (newX < 0) newX = 0;
        if (newX > sliderWidth) newX = sliderWidth;

        if (activeThumb.current === 'left') {
            const currentRightX = rightThumbX._value;
            if (newX > currentRightX) newX = currentRightX;
            leftThumbX.setValue(newX);
            const price = Math.round(minPrice + (maxPrice - minPrice) * (newX / sliderWidth));
            setDisplayMin(price);
        } else if (activeThumb.current === 'right') {
            const currentLeftX = leftThumbX._value;
            if (newX < currentLeftX) newX = currentLeftX;
            rightThumbX.setValue(newX);
            const price = Math.round(minPrice + (maxPrice - minPrice) * (newX / sliderWidth));
            setDisplayMax(price);
        }
    };

    const formatPrice = (value) => {
        return "$" + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleReset = () => {
        setSelectedPropertyType("All");
        setPriceRange({ min: 0, max: 5000000 });
        setDisplayMin(0);
        setDisplayMax(5000000);
        leftThumbX.setValue(0);
        rightThumbX.setValue(sliderWidth);
        setLocation("");
    };

    const handleApply = () => {
        const returnTo = route?.params?.returnTo || "HomeScreen";
        navigation.navigate(returnTo, {
            filters: {
                propertyType: selectedPropertyType,
                minPrice: displayMin,
                maxPrice: displayMax,
                location: (location || "").trim()
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" />

            {/* Header */}
            <View style={[styles.header, { height: verticalScale(60), paddingHorizontal: scale(20) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scale(24)} color="#1F2937" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>Filters</Text>
                <View style={{ width: scale(24) }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: verticalScale(100) }}>

                {/* Price Range Section */}
                <View style={[styles.section, { marginTop: verticalScale(10) }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionLabel, { fontSize: scale(16) }]}>Price Range</Text>
                        <TouchableOpacity style={[styles.mapButton, { paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(8) }]}>
                            <Ionicons name="map-outline" size={scale(16)} color="#FFF" />
                            <Text style={[styles.mapButtonText, { fontSize: scale(14), marginLeft: scale(6) }]}>Map</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Dynamic Range Slider */}
                    <View
                        style={[styles.sliderContainer, { marginTop: verticalScale(25) }]}
                        {...sliderPanResponder.panHandlers}
                    >
                        <View style={[styles.sliderTrack, { height: verticalScale(6), borderRadius: scale(3) }]}>
                            <Animated.View
                                style={[
                                    styles.sliderActiveTrack,
                                    {
                                        left: leftThumbX,
                                        width: Animated.subtract(rightThumbX, leftThumbX),
                                        height: "100%",
                                        borderRadius: scale(3)
                                    }
                                ]}
                                pointerEvents="none"
                            />
                        </View>
                        <Animated.View
                            style={[styles.thumb, { left: leftThumbX, width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2 }]}
                            pointerEvents="none"
                        />
                        <Animated.View
                            style={[styles.thumb, { left: rightThumbX, width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2 }]}
                            pointerEvents="none"
                        />
                    </View>

                    <View style={[styles.priceLabels, { marginTop: verticalScale(15) }]}>
                        <View>
                            <Text style={[styles.priceHint, { fontSize: scale(12) }]}>Minimum</Text>
                            <Text style={[styles.priceValue, { fontSize: scale(16) }]}>{formatPrice(displayMin)}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                            <Text style={[styles.priceHint, { fontSize: scale(12) }]}>Maximum</Text>
                            <Text style={[styles.priceValue, { fontSize: scale(16) }]}>{formatPrice(displayMax)}</Text>
                        </View>
                    </View>
                </View>

                {/* Property Type Section */}
                <View style={[styles.section, { marginTop: verticalScale(40) }]}>
                    <Text style={[styles.sectionLabel, { fontSize: scale(16), marginBottom: verticalScale(15) }]}>Property Type</Text>
                    <View style={styles.propertyTypeGrid}>
                        {propertyTypes.map((type) => {
                            const isActive = selectedPropertyType === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.typePill,
                                        { height: verticalScale(50), borderRadius: scale(12), marginRight: scale(12) },
                                        isActive && styles.typePillActive
                                    ]}
                                    onPress={() => setSelectedPropertyType(type)}
                                >
                                    <Text style={[styles.typePillText, { fontSize: scale(14) }, isActive && styles.typePillTextActive]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Location Section */}
                <View style={[styles.section, { marginTop: verticalScale(40) }]}>
                    <Text style={[styles.sectionLabel, { fontSize: scale(16), marginBottom: verticalScale(15) }]}>Location</Text>
                    <View style={[styles.inputContainer, { height: verticalScale(55), borderRadius: scale(12), paddingHorizontal: scale(15) }]}>
                        <TextInput
                            style={[styles.input, { fontSize: scale(15) }]}
                            placeholder="Enter location..."
                            placeholderTextColor="#94A3B8"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { paddingHorizontal: scale(20), paddingBottom: verticalScale(30) }]}>
                <TouchableOpacity
                    style={[styles.resetButton, { paddingVertical: verticalScale(12), borderRadius: scale(10), marginBottom: verticalScale(15) }]}
                    onPress={handleReset}
                >
                    <Text style={[styles.resetButtonText, { fontSize: scale(12) }]}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.applyButton, { paddingVertical: verticalScale(12), borderRadius: scale(10) }]}
                    onPress={handleApply}
                >
                    <Text style={[styles.applyButtonText, { fontSize: scale(14) }]}>Show {filteredCount} Properties</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFDFD",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    sectionLabel: {
        fontWeight: "700",
        color: "#1E293B",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1D5FAD",
    },
    mapButtonText: {
        color: "#FFF",
        fontWeight: "600",
    },
    sliderContainer: {
        width: "100%",
        justifyContent: "center",
    },
    sliderTrack: {
        width: "100%",
        backgroundColor: "#F1F5F9",
    },
    sliderActiveTrack: {
        backgroundColor: "#1D5FAD",
        position: "absolute",
    },
    thumb: {
        position: "absolute",
        backgroundColor: "#FFF",
        borderWidth: 2,
        borderColor: "#1D5FAD",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        transform: [{ translateX: -scale(10) }],
    },
    priceLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    priceHint: {
        color: "#94A3B8",
        fontWeight: "500",
        marginBottom: 4,
    },
    priceValue: {
        color: "#1E293B",
        fontWeight: "700",
    },
    propertyTypeGrid: {
        flexDirection: "row",
    },
    typePill: {
        flex: 1,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    typePillActive: {
        borderColor: "#1D5FAD",
        backgroundColor: "#F0F7FF",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    typePillText: {
        color: "#64748B",
        fontWeight: "500",
    },
    typePillTextActive: {
        color: "#1D5FAD",
        fontWeight: "700",
    },
    inputContainer: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        justifyContent: "center",
    },
    input: {
        color: "#1E293B",
    },
    footer: {
        backgroundColor: "#FFF",
        paddingTop: 10,
    },
    resetButton: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
    },
    resetButtonText: {
        color: "#64748B",
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    applyButton: {
        backgroundColor: "#1D5FAD",
        justifyContent: "center",
        alignItems: "center",
    },
    applyButtonText: {
        color: "#FFF",
        fontWeight: "700",
    },
});
