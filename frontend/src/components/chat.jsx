import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../socket";
import starBg from "../assets/bg.jpg";

/* ------------------ DATA ------------------ */
const reportReasons = [
  "Inappropriate messages",
  "Harassment",
  "Spam / bot",
  "Made me uncomfortable",
  "Other",
];

const starterMessages = [
  "👋 Hey",
  "🙂 Hi there",
  "How’s your day going?",
  "What are you studying?",
  "Late night chat? 🌙",
];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ended, setEnded] = useState(false);

  /* ⏳ TIMER */
  const [timeLeft, setTimeLeft] = useState(300);
  const [showExtend, setShowExtend] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const [otherDeciding, setOtherDeciding] = useState(false);

  /* ⌨️ TYPING */
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { roomId } = location.state || {};

  /* ---------------- SAFETY ---------------- */
  useEffect(() => {
    if (!roomId) navigate("/matchmaking");
  }, [roomId, navigate]);

  if (!roomId) return null;

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (ended || showExtend) return;

    if (timeLeft <= 0) {
      setShowExtend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, ended, showExtend]);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    socket.emit("join-room", { roomId });

    socket.on("receive-message", ({ text, senderSocketId }) => {
      if (senderSocketId === socket.id) return;
      setMessages((p) => [...p, { text, sender: "other" }]);
    });

    socket.on("typing", () => {
      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 1200);
    });

    socket.on("other-voted", () => {
      setOtherDeciding(true);
    });

    socket.on("extend-result", ({ decision, extraTime }) => {
      setOtherDeciding(false);

      if (decision === "reject") {
        forceEnd("One person didn’t want to continue.");
        return;
      }

      setTimeLeft((t) => t + extraTime);
      setShowExtend(false);
      setMyVote(null);

      setTimeout(() => {
        toast({
          title: "Chat extended 🎉",
          description: `Added ${extraTime / 60} minutes`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      }, 100);
    });

    // 🔥 ALWAYS end chat on report
    socket.on("chat-ended", () => {
      forceEnd("Chat ended.");
    });

    return () => socket.removeAllListeners();
  }, [roomId, toast]);

  /* ---------------- FORCE END ---------------- */
  const forceEnd = (msg) => {
    if (ended) return;
    setEnded(true);
    setShowExtend(false);
    setMessages((p) => [...p, { text: msg, sender: "system" }]);
    setTimeout(() => navigate("/matchmaking"), 2000);
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = (text) => {
    if (!text.trim() || ended) return;
    setMessages((p) => [...p, { text, sender: "me" }]);
    socket.emit("send-message", { roomId, text });
    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit("typing", { roomId });
  };

  /* ---------------- REPORT ---------------- */
  const handleReport = () => {
    socket.emit("end-chat", { roomId });
    onClose();
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Box minH="100vh" bgImage={`url(${starBg})`} bgRepeat="repeat">
      <Box minH="100vh" bg="rgba(0,0,0,0.75)">
        {/* TOP BAR */}
        <Box px={4} py={3} borderBottom="1px solid rgba(0,242,255,0.3)">
          <HStack justify="space-between">
            <Text color="#00f2ff" fontWeight="bold">
              Someone you don't know
            </Text>
            <HStack spacing={3}>
              <Text color="cyan.300">⏳ {formatTime()}</Text>
              <Button size="sm" variant="outline" colorScheme="red" onClick={onOpen}>
                Report
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* CHAT */}
        <VStack spacing={3} px={4} py={4} minH="calc(100vh - 160px)">
          {messages.length === 0 && (
            <VStack>
              <Text color="gray.400">Start the conversation</Text>
              <HStack wrap="wrap" justify="center">
                {starterMessages.map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    variant="outline"
                    colorScheme="cyan"
                    onClick={() => sendMessage(m)}
                  >
                    {m}
                  </Button>
                ))}
              </HStack>
            </VStack>
          )}

          {messages.map((m, i) => (
            <HStack key={i} justify={m.sender === "me" ? "flex-end" : m.sender === "system" ? "center" : "flex-start"} w="100%">
              <Box
                bg={m.sender === "me" ? "#00f2ff" : m.sender === "system" ? "transparent" : "gray.700"}
                color={m.sender === "me" ? "black" : "white"}
                px={4}
                py={2}
                borderRadius="lg"
                maxW="75%"
              >
                <Text fontSize="sm">{m.text}</Text>
              </Box>
            </HStack>
          ))}

          {isTyping && (
            <HStack>
              <Spinner size="xs" />
              <Text fontSize="sm" color="gray.400">Someone is typing…</Text>
            </HStack>
          )}

          {otherDeciding && (
            <Text fontSize="sm" color="yellow.300">
              Other user is deciding…
            </Text>
          )}
        </VStack>

        {!ended && (
          <HStack px={4} py={3} borderTop="1px solid rgba(0,242,255,0.3)">
            <Input
              placeholder="Type something…"
              value={input}
              onChange={handleTyping}
              bg="black"
              color="white"
              borderColor="#00f2ff"
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <Button bg="#00f2ff" color="black" onClick={() => sendMessage(input)}>
              Send
            </Button>
          </HStack>
        )}
      </Box>

      {/* REPORT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="black" color="white">
          <ModalHeader color="#00f2ff">Report chat</ModalHeader>
          <ModalBody>
            <VStack spacing={3}>
              {reportReasons.map((r) => (
                <Button key={r} variant="outline" colorScheme="red" onClick={handleReport}>
                  {r}
                </Button>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Chat;
