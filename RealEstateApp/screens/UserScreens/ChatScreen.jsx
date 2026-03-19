import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { io } from "socket.io-client";
import { api, markMessagesAsRead, setAuthToken } from "../../api/api";
import CustomAlert from "../../components/CustomAlert";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

export default function ChatScreen({ route, navigation }) {
  const { person } = route.params || {};
  const partnerId = person?.id;
  const partnerName = person?.name || "Support";
  const partnerAvatar = person?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80";

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [myUserId, setMyUserId] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "" });
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("userToken");
      if (!t) return;
      setToken(t);
      setAuthToken(t);
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (!token || !partnerId) return;

    // Fetch initial history
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversation/${partnerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
        
        // Mark messages as read since the user is viewing the chat
        await markMessagesAsRead(partnerId);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };
    fetchMessages();

    // Setup Socket
    const socketUrl = api.defaults.baseURL.replace("/api", "");
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("User connected to socket");

      api.get("/user/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setMyUserId(res.data._id);
          socket.emit("joinRoom", res.data._id);
        })
        .catch(err => console.error("Failed to fetch user profile for socket room:", err));
    });

    socket.on("receiveMessage", (newMessage) => {
      // Check if message belongs to this specific conversation
      if (newMessage.sender === partnerId || newMessage.receiver === partnerId) {
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, partnerId]);

  const sendMessage = async () => {
    if (!message.trim() || !partnerId) return;

    try {
      const res = await api.post(
        "/chat",
        { message, receiverId: partnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Wait for socket to receive message instead of optimistic update
      setMessage("");
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (err) {
      console.error("Send message error:", err);
      setAlertConfig({ visible: true, title: "Error", message: err.response?.data?.error || "Failed to send message" });
    }
  };

  const renderItem = ({ item }) => {
    // Distinguish if current user sent it or received it
    const isMe = item.sender?._id === myUserId || item.sender === myUserId || item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isMe ? styles.userWrapper : styles.adminWrapper]}>
        <View style={[styles.messageBubble, isMe ? styles.userBubble : styles.adminBubble]}>
          <Text style={[styles.messageText, isMe ? styles.userText : styles.adminText]}>
            {item.message}
          </Text>
        </View>
        <Text style={[styles.timestamp, isMe ? styles.userTimestamp : styles.adminTimestamp]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={scale(24)} color="#1F2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{partnerName}</Text>

        <Image
          source={{ uri: partnerAvatar }}
          style={styles.headerAvatar}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline={false}
            />
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Feather name="send" size={scale(18)} color="#FFF" style={{ marginLeft: scale(-2) }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: scale(5),
    marginLeft: scale(-5),
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    flex: 1,
  },
  headerAvatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#E5E7EB",
  },
  listContainer: {
    padding: scale(20),
    paddingBottom: verticalScale(20),
  },
  messageWrapper: {
    marginBottom: verticalScale(15),
    maxWidth: "80%",
  },
  userWrapper: {
    alignSelf: "flex-end",
  },
  adminWrapper: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: scale(18),
  },
  userBubble: {
    backgroundColor: "#1D5FAD",
    borderBottomRightRadius: scale(4),
  },
  adminBubble: {
    backgroundColor: "#F3F6F8",
    borderBottomLeftRadius: scale(4),
  },
  messageText: {
    fontSize: scale(15),
    lineHeight: scale(20),
  },
  userText: {
    color: "#FFFFFF",
  },
  adminText: {
    color: "#1F2937",
  },
  timestamp: {
    fontSize: scale(11),
    color: "#9CA3AF",
    marginTop: verticalScale(4),
  },
  userTimestamp: {
    alignSelf: "flex-end",
    marginRight: scale(4),
  },
  adminTimestamp: {
    alignSelf: "flex-start",
    marginLeft: scale(4),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    height: verticalScale(48),
    justifyContent: "center",
  },
  input: {
    fontSize: scale(15),
    color: "#1F2937",
    height: '100%',
  },
  sendBtn: {
    backgroundColor: "#95B5E4",
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    marginLeft: scale(12),
    justifyContent: "center",
    alignItems: "center",
  },
});
