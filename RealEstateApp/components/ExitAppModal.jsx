import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;

const ExitAppModal = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Exit App</Text>
                    <Text style={styles.modalText}>
                        Are you sure you want to exit the app?
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    modalView: {
        width: width * 0.85,
        backgroundColor: "white",
        borderRadius: scale(15),
        padding: scale(20),
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: "bold",
        marginBottom: scale(10),
        color: "#000",
    },
    modalText: {
        fontSize: scale(14),
        marginBottom: scale(20),
        color: "#4B5563",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    button: {
        flex: 1,
        paddingVertical: scale(12),
        borderRadius: scale(10),
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginRight: scale(10),
    },
    confirmButton: {
        backgroundColor: "#1D5FAD", // Using the theme blue color instead of red for exiting
        marginLeft: scale(10),
    },
    cancelButtonText: {
        color: "#1E293B",
        fontWeight: "600",
        fontSize: scale(14),
    },
    confirmButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: scale(14),
    },
});

export default ExitAppModal;
