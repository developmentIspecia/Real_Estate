import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    useWindowDimensions,
} from "react-native";

const ActionModal = ({ visible, onClose, onConfirm, title, message }) => {
    const { width, height } = useWindowDimensions();
    const scale = (size) => (width / 375) * size;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { width: width * 0.9, borderRadius: scale(25), padding: scale(24) }]}>
                    <Text style={[styles.modalTitle, { fontSize: scale(22) }]}>{title}</Text>
                    <Text style={[styles.modalText, { fontSize: scale(15), marginTop: scale(8), marginBottom: scale(30) }]}>
                        {message}
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { marginRight: scale(8), paddingVertical: scale(14), borderRadius: scale(15) }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelButtonText, { fontSize: scale(16) }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { marginLeft: scale(8), paddingVertical: scale(14), borderRadius: scale(15) }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.confirmButtonText, { fontSize: scale(16) }]}>Yes</Text>
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
    cancelButton: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    confirmButton: {
        backgroundColor: "#EF4444",
    },
    cancelButtonText: {
        color: "#1E293B",
        fontWeight: "600",
    },
    confirmButtonText: {
        color: "white",
        fontWeight: "600",
    },
});

export default ActionModal;
