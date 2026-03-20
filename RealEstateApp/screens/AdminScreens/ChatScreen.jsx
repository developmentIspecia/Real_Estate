import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { api, markMessagesAsRead, setAuthToken } from "../../api/api";
import CustomAlert from "../../components/CustomAlert";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

export default function ChatScreen({ route, navigation }) {
    const { userId, userName, profilePhoto } = route.params || {};
    const { width, height } = useWindowDimensions();
    const partnerAvatar = profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=1D5FAD&color=fff&size=128`;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
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
    if (!token || !userId) return;

    // Fetch initial history
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversation/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 200);

        // Mark messages as read since the admin is viewing the chat
        await markMessagesAsRead(userId);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };
    fetchMessages();

    // Setup Socket
    const socketUrl = api.defaults.baseURL.replace("/api", "");
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("Admin connected to socket");
      
      // Fetch profile to get my ID for room joining
      api.get("/user/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setMyUserId(res.data._id);
          socket.emit("joinRoom", res.data._id); // Join my own room
          socket.emit("joinRoom", "admin");      // Also join admin room
        })
        .catch(err => console.error("Failed to fetch admin profile for socket:", err));
    });

    socket.on("receiveMessage", (newMessage) => {
      // Check if message belongs to this specific conversation
      const senderId = newMessage.sender?._id || newMessage.sender;
      const receiverId = newMessage.receiver?._id || newMessage.receiver;

      if (senderId === userId || receiverId === userId) {
        setMessages((prev) => {
            // Prevent duplicate messages if socket emits multiple times
            if (prev.find(m => m._id === newMessage._id)) return prev;
            return [...prev, newMessage];
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, userId]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const res = await api.post(
        "/chat",
        { receiverId: userId, message: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Removed setMessages optimistic update here because the socket will trigger receiveMessage almost instantly
      setMessageText("");
      setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
    } catch (err) {
      console.error("Send message error:", err);
      setAlertConfig({ visible: true, title: "Error", message: err.response?.data?.error || "Failed to send message" });
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === myUserId || item.sender?._id === myUserId || item.role === 'admin';
    return (
      <View style={[styles.messageWrapper, isMe ? styles.adminWrapper : styles.userWrapper]}>
        <View style={[styles.messageBubble, isMe ? styles.adminBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isMe ? styles.adminText : styles.userText]}>
            {item.message}
          </Text>
        </View>
        <Text style={[styles.timestamp, isMe ? styles.adminTimestamp : styles.userTimestamp]}>
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
      <View style={[styles.header, { margin: scale(10), borderRadius: scale(15) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={scale(24)} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Image
            source={{ uri: partnerAvatar }}
            style={styles.headerAvatar}
          />
          <Text style={styles.headerTitle}>{userName || "User"}</Text>
        </View>
        <View style={{ width: scale(24) }} /> 
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={messageText}
              onChangeText={setMessageText}
              multiline={false}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: messageText.trim() ? "#1D5FAD" : "#94B3D8",
                opacity: messageText.trim() ? 1 : 0.6
              }
            ]}
            onPress={sendMessage}
            disabled={!messageText.trim()}
          >
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
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    backgroundColor: "#1B5EAF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: scale(10),
  },
  backButton: {
    padding: scale(5),
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: scale(10),
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
  adminWrapper: {
    alignSelf: "flex-end",
  },
  userWrapper: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: scale(18),
  },
  adminBubble: {
    backgroundColor: "#1D5FAD",
    borderBottomRightRadius: scale(4),
  },
  userBubble: {
    backgroundColor: "#F3F6F8",
    borderBottomLeftRadius: scale(4),
  },
  messageText: {
    fontSize: scale(15),
    lineHeight: scale(20),
  },
  adminText: {
    color: "#FFFFFF",
  },
  userText: {
    color: "#1F2937",
  },
  timestamp: {
    fontSize: scale(11),
    color: "#9CA3AF",
    marginTop: verticalScale(4),
  },
  adminTimestamp: {
    alignSelf: "flex-end",
    marginRight: scale(4),
  },
  userTimestamp: {
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
