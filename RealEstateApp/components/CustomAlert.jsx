import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";
import { scale, width } from "../utils/responsive";

const CustomAlert = ({ visible, onClose, title, message }) => {

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { width: width * 0.85, borderRadius: scale(15), padding: scale(20) }]}>
                    <Text style={[styles.modalTitle, { fontSize: scale(18) }]}>{title}</Text>
                    <Text style={[styles.modalText, { fontSize: scale(14), marginTop: scale(10), marginBottom: scale(20) }]}>
                        {message}
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { paddingVertical: scale(10), borderRadius: scale(8) }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.confirmButtonText, { fontSize: scale(14) }]}>OK</Text>
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
        backgroundColor: "white",
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    modalText: {
        color: "#475569",
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
    },
    button: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    confirmButton: {
        backgroundColor: "#1D5FAD", // Using the theme blue color from LoginScreen
    },
    confirmButtonText: {
        color: "white",
        fontWeight: "600",
    },
});

export default CustomAlert;
