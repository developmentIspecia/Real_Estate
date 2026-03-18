import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    Image,
    Modal,
    FlatList,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateProperty, API_BASE } from "../../api/api";
import CustomAlert from "../../components/CustomAlert";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

export default function EditPropertyScreen({ navigation, route }) {
    const { property } = route?.params || {};

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [beds, setBeds] = useState("");
    const [baths, setBaths] = useState("");
    const [area, setArea] = useState("");
    const [amenities, setAmenities] = useState("");
    const [images, setImages] = useState([]); // Mix of existing URLs and new local URIs
    const [newImages, setNewImages] = useState([]); // Only new local URIs for upload
    const [loading, setLoading] = useState(false);
    const [sellType, setSellType] = useState("buy");
    const [contact, setContact] = useState("");
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: "",
        message: "",
        onCloseAction: null,
    });

    const showAlert = (title, message, onCloseAction = null) => {
        setAlertConfig({ visible: true, title, message, onCloseAction });
    };

    const categories = [
        { label: "House", value: "house" },
        { label: "Flat", value: "flat" },
        { label: "Land", value: "land" },
        { label: "Commercial", value: "commercial" },
        { label: "Others", value: "others" },
    ];

    useEffect(() => {
        if (property) {
            setTitle(property.title || "");
            setDescription(property.description || "");
            setPrice(property.price ? property.price.toString() : "");
            setLocation(property.location || "");
            setCategory(property.category || "");
            setBeds(property.beds ? property.beds.toString() : "0");
            setBaths(property.baths ? property.baths.toString() : "0");
            setArea(property.sqft ? property.sqft.toString() : "0");
            setAmenities(property.amenities || "");
            setSellType(property.sellType || "buy");
            setContact(property.contact || "");

            // Map existing image paths to full URLs if they are relative
            const existingImages = (property.images || []).map(img =>
                img.startsWith('http') ? img : `${API_BASE.replace('/api', '')}/${img.replace(/\\/g, '/')}`
            );
            setImages(existingImages);
        }
    }, [property]);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                showAlert("Permission Required", "Allow access to your gallery to upload images.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                const selectedImages = result.assets.map(asset => asset.uri);
                setImages((prev) => [...prev, ...selectedImages]);
                setNewImages((prev) => [...prev, ...selectedImages]);
            }
        } catch (err) {
            console.error("ImagePicker error:", err);
            showAlert("Error", "Failed to pick images.");
        }
    };

    const handleUpdate = async () => {
        if (!title || !description || !price || !location || !category) {
            showAlert("Error", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        const formData = new FormData();

        // Add new images to FormData
        newImages.forEach((uri, index) => {
            const uriParts = uri.split(".");
            const fileType = uriParts[uriParts.length - 1];
            formData.append("images", {
                uri,
                name: `property_edit_${index}.${fileType}`,
                type: `image/${fileType}`,
            });
        });

        // Add kept existing images (as names or paths if backend supports it)
        const keptExistingImages = images.filter(img => !newImages.includes(img));
        formData.append("existingImages", JSON.stringify(keptExistingImages));

        formData.append("title", title);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("location", location);
        formData.append("category", category);
        formData.append("beds", beds);
        formData.append("baths", baths);
        formData.append("sqft", area);
        formData.append("amenities", amenities);
        formData.append("sellType", sellType);
        formData.append("contact", contact);

        try {
            await updateProperty(property._id, formData);
            showAlert("Success", "Property updated successfully!", () => {
                navigation.goBack();
            });
        } catch (err) {
            console.error("Update error:", err);
            showAlert("Error", "Failed to update property.");
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, placeholder, value, onChangeText, options = {}) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, options.multiline && styles.textArea]}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                value={value}
                onChangeText={onChangeText}
                multiline={options.multiline}
                numberOfLines={options.numberOfLines}
                keyboardType={options.keyboardType || "default"}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1D5FAD" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scale(24)} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Property</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {renderInput("Property Title", "Enter property title", title, setTitle)}
                {renderInput("Description", "Enter property description", description, setDescription, { multiline: true, numberOfLines: 4 })}
                {renderInput("Price ($)", "Enter price", price, setPrice, { keyboardType: "numeric" })}
                {renderInput("Location", "Enter location", location, setLocation)}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity
                        style={styles.pickerWrapper}
                        onPress={() => setCategoryModalVisible(true)}
                    >
                        <Text style={[styles.pickerValue, !category && { color: "#94A3B8" }]}>
                            {category ? categories.find(c => c.value === category)?.label : "Select category"}
                        </Text>
                        <Ionicons name="chevron-down" size={scale(20)} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* Category Selection Modal */}
                <Modal
                    visible={categoryModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setCategoryModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setCategoryModalVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Category</Text>
                                <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                    <Ionicons name="close" size={scale(24)} color="#475569" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.categoryItem}
                                        onPress={() => {
                                            setCategory(item.value);
                                            setCategoryModalVisible(false);
                                        }}
                                    >
                                        <Text style={[styles.categoryItemText, category === item.value && styles.categoryItemTextActive]}>
                                            {item.label}
                                        </Text>
                                        {category === item.value && (
                                            <Ionicons name="checkmark-circle" size={scale(20)} color="#1D5FAD" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Triple Row: Beds, Baths, Area */}
                <View style={styles.tripleRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Beds</Text>
                        <TextInput
                            style={styles.smallInput}
                            value={beds}
                            onChangeText={setBeds}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginHorizontal: scale(10) }]}>
                        <Text style={styles.label}>Baths</Text>
                        <TextInput
                            style={styles.smallInput}
                            value={baths}
                            onChangeText={setBaths}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1.2 }]}>
                        <Text style={styles.label}>Area (sqft)</Text>
                        <TextInput
                            style={styles.smallInput}
                            value={area}
                            onChangeText={setArea}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {renderInput("Amenities", "Pool, Gym, Parking", amenities, setAmenities)}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Property Images</Text>
                    <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
                        <View style={styles.uploadCircle}>
                            <Feather name="upload" size={scale(28)} color="#FFF" />
                        </View>
                        <Text style={styles.uploadMainText}>Click to upload images</Text>
                        <Text style={styles.uploadSubText}>PNG, JPG up to 10MB</Text>
                    </TouchableOpacity>

                    {/* Preview Images */}
                    {images.length > 0 && (
                        <ScrollView horizontal style={styles.imagePreviewScroll} showsHorizontalScrollIndicator={false}>
                            {images.map((img, idx) => (
                                <View key={idx} style={styles.previewImageContainer}>
                                    <Image source={{ uri: img }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeImageBtn}
                                        onPress={() => {
                                            const newImagesList = images.filter((_, i) => i !== idx);
                                            setImages(newImagesList);
                                            if (newImages.includes(img)) {
                                                setNewImages(newImages.filter(i => i !== img));
                                            }
                                        }}
                                    >
                                        <Ionicons name="close-circle" size={scale(22)} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleUpdate} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Update Property</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => {
                    setAlertConfig({ ...alertConfig, visible: false });
                    if (alertConfig.onCloseAction) {
                        alertConfig.onCloseAction();
                    }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        backgroundColor: "#1D5FAD",
        paddingVertical: verticalScale(15),
        paddingHorizontal: scale(20),
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        marginRight: scale(20),
    },
    headerTitle: {
        color: "#FFF",
        fontSize: scale(18),
        fontWeight: "bold",
    },
    scrollContent: {
        padding: scale(20),
        paddingBottom: verticalScale(40),
    },
    inputGroup: {
        marginBottom: verticalScale(20),
    },
    label: {
        fontSize: scale(14),
        fontWeight: "600",
        color: "#475569",
        marginBottom: verticalScale(8),
    },
    input: {
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: scale(12),
        paddingHorizontal: scale(15),
        height: verticalScale(50),
        fontSize: scale(14),
        color: "#1E293B",
    },
    textArea: {
        height: verticalScale(100),
        paddingTop: verticalScale(12),
        textAlignVertical: "top",
    },
    pickerWrapper: {
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: scale(12),
        paddingHorizontal: scale(15),
        height: verticalScale(50),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pickerValue: {
        fontSize: scale(14),
        color: "#1E293B",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: scale(20),
    },
    modalContent: {
        backgroundColor: "#FFF",
        width: "100%",
        borderRadius: scale(16),
        maxHeight: "80%",
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: scale(20),
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: "bold",
        color: "#1E293B",
    },
    categoryItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: scale(18),
        borderBottomWidth: 1,
        borderBottomColor: "#F8FAFC",
    },
    categoryItemText: {
        fontSize: scale(16),
        color: "#475569",
    },
    categoryItemTextActive: {
        color: "#1D5FAD",
        fontWeight: "bold",
    },
    tripleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    smallInput: {
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: scale(12),
        height: verticalScale(50),
        textAlign: "center",
        fontSize: scale(14),
        color: "#1E293B",
    },
    uploadArea: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
        borderRadius: scale(16),
        height: verticalScale(160),
        justifyContent: "center",
        alignItems: "center",
        padding: scale(10),
    },
    uploadCircle: {
        backgroundColor: "#1D5FAD",
        width: scale(52),
        height: scale(52),
        borderRadius: scale(26),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: verticalScale(10),
    },
    uploadMainText: {
        fontSize: scale(15),
        fontWeight: "600",
        color: "#1E293B",
    },
    uploadSubText: {
        fontSize: scale(12),
        color: "#94A3B8",
        marginTop: verticalScale(4),
    },
    imagePreviewScroll: {
        marginTop: verticalScale(15),
    },
    previewImageContainer: {
        marginRight: scale(12),
        position: "relative",
    },
    previewImage: {
        width: scale(90),
        height: scale(90),
        borderRadius: scale(12),
    },
    removeImageBtn: {
        position: "absolute",
        top: scale(-5),
        right: scale(-5),
        backgroundColor: "#FFF",
        borderRadius: scale(12),
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    submitButton: {
        backgroundColor: "#1D5FAD",
        height: verticalScale(50),
        borderRadius: scale(12),
        justifyContent: "center",
        alignItems: "center",
        marginTop: verticalScale(10),
        shadowColor: "#1D5FAD",
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.3,
        shadowRadius: scale(6),
        elevation: 5,
    },
    submitButtonText: {
        color: "#FFF",
        fontSize: scale(16),
        fontWeight: "bold",
    },
});
