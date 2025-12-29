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
  ModalFooter,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../socket";
import starBg from "../assets/bg.jpg";

/* ------------------ DATA ------------------ */
const starterMessages = ["👋 Hey", "🙂 Hi", "🌙 Late night?", "✨ Vibes?", "👀"];

const reportReasons = [
  "Inappropriate messages",
  "Harassment",
  "Spam / bot",
  "Made me uncomfortable",
  "Other",
];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ended, setEnded] = useState(false);

  /* ⏳ TIMER */
  const [timeLeft, setTimeLeft] = useState(300);
  const [showExtend, setShowExtend] = useState(false);
  const [myVote, setMyVote] = useState(null);

  const hasEndedRef = useRef(false);

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

    const t = setInterval(() => {
      setTimeLeft((p) => p - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [timeLeft, ended, showExtend]);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    socket.emit("join-room", { roomId });

    const onReceiveMessage = ({ text, senderSocketId }) => {
      if (senderSocketId === socket.id) return;
      setMessages((prev) => [...prev, { text, sender: "other" }]);
    };

    const onExtendDecision = ({ decision, extraTime }) => {
      if (decision === "reject") {
        endChat("One person didn’t want to continue.");
      } else {
        toast({
          title: "Chat extended 🎉",
          description: `Added ${extraTime / 60} minutes`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setTimeLeft(extraTime);
        setShowExtend(false);
        setMyVote(null);
      }
    };

    const onChatEnded = () => {
      if (hasEndedRef.current || showExtend) return;
      endChat("The other person left the chat.");
    };

    socket.on("receive-message", onReceiveMessage);
    socket.on("extend-decision", onExtendDecision);
    socket.on("chat-ended", onChatEnded);

    return () => {
      socket.off("receive-message", onReceiveMessage);
      socket.off("extend-decision", onExtendDecision);
      socket.off("chat-ended", onChatEnded);
    };
  }, [roomId, showExtend, toast]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = (text) => {
    if (!text.trim() || ended) return;

    setMessages((prev) => [...prev, { text, sender: "me" }]);
    socket.emit("send-message", { roomId, text });
    setInput("");
  };

  /* ---------------- END CHAT ---------------- */
  const endChat = (msg) => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    setEnded(true);
    setShowExtend(false);

    setMessages((prev) => [...prev, { text: msg, sender: "system" }]);
    socket.emit("end-chat", { roomId });

    setTimeout(() => navigate("/matchmaking"), 1500);
  };

  /* ---------------- EXTEND ---------------- */
  const voteExtend = (minutes) => {
    if (myVote) return;

    setMyVote("yes");

    toast({
      title: "Extension requested",
      description: "Waiting for the other person…",
      status: "info",
      duration: 3000,
      isClosable: true,
    });

    socket.emit("extend-decision", {
      roomId,
      decision: "extend",
      extraTime: minutes * 60,
    });
  };

  const voteReject = () => {
    if (myVote) return;
    setMyVote("no");

    socket.emit("extend-decision", {
      roomId,
      decision: "reject",
    });
  };

  /* ---------------- REPORT ---------------- */
  const handleReport = (reason) => {
    setMessages((prev) => [
      ...prev,
      { text: `You reported the chat (${reason}).`, sender: "system" },
    ]);
    socket.emit("end-chat", { roomId });
    onClose();
    setTimeout(() => navigate("/matchmaking"), 1500);
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
              Someone from your college 🎓
            </Text>
            <HStack spacing={3}>
              <Text color="cyan.300">⏳ {formatTime()}</Text>
              <Button size="sm" variant="outline" colorScheme="red" onClick={onOpen}>
                Report
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="cyan"
                onClick={() => endChat("You ended the chat.")}
              >
                End Chat
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* CHAT */}
        <VStack spacing={4} px={4} py={4} minH="calc(100vh - 140px)">
          {messages.length === 0 ? (
            <>
              <Text color="gray.400">Break the silence</Text>
              <HStack wrap="wrap">
                {starterMessages.map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    variant="outline"
                    borderColor="#00f2ff"
                    color="#00f2ff"
                    onClick={() => sendMessage(m)}
                  >
                    {m}
                  </Button>
                ))}
              </HStack>
            </>
          ) : (
            messages.map((m, i) => (
              <HStack
                key={i}
                justify={
                  m.sender === "me"
                    ? "flex-end"
                    : m.sender === "system"
                    ? "center"
                    : "flex-start"
                }
                w="100%"
              >
                <Box
                  bg={
                    m.sender === "me"
                      ? "#00f2ff"
                      : m.sender === "system"
                      ? "transparent"
                      : "gray.700"
                  }
                  color={
                    m.sender === "me"
                      ? "black"
                      : m.sender === "system"
                      ? "gray.400"
                      : "white"
                  }
                  px={4}
                  py={2}
                  borderRadius="lg"
                  maxW="75%"
                >
                  <Text fontSize="sm">{m.text}</Text>
                </Box>
              </HStack>
            ))
          )}
        </VStack>

        {/* INPUT */}
        {!ended && (
          <HStack px={4} py={3} borderTop="1px solid rgba(0,242,255,0.3)">
            <Input
              placeholder="Type something…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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

      {/* EXTEND MODAL */}
      <Modal isOpen={showExtend} isCentered>
        <ModalOverlay />
        <ModalContent bg="black" color="white">
          <ModalHeader color="#00f2ff">Extend chat?</ModalHeader>
          <ModalBody>
            <VStack spacing={3}>
              <Button onClick={() => voteExtend(5)}>➕ 5 minutes</Button>
              <Button onClick={() => voteExtend(10)}>➕ 10 minutes</Button>
              <Button colorScheme="red" onClick={voteReject}>
                Not needed
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            {myVote && <Text fontSize="sm">Waiting for other person…</Text>}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* REPORT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="black" color="white">
          <ModalHeader color="#00f2ff">Report chat</ModalHeader>
          <ModalBody>
            <VStack spacing={3}>
              {reportReasons.map((r) => (
                <Button
                  key={r}
                  variant="outline"
                  colorScheme="red"
                  onClick={() => handleReport(r)}
                >
                  {r}
                </Button>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Chat;
