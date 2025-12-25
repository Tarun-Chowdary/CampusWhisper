import React, { useState, useEffect } from "react";
import { Button, VStack, Box, Text, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";
import socket from "../socket";
import starBg from "../assets/bg.jpg";

/* ------------------ Animations ------------------ */
const glowPulse = keyframes`
  0% { text-shadow: 0 0 5px #00f2ff; }
  50% { text-shadow: 0 0 25px #00f2ff; }
  100% { text-shadow: 0 0 5px #00f2ff; }
`;

const blinkCursor = keyframes`
  0%,50%,100% { opacity: 1; }
  25%,75% { opacity: 0; }
`;

const Matchmaking = () => {
  const titleText = "CampusWhispher";
  const [typed, setTyped] = useState("");
  const [tIndex, setTIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* ---------------- Typing Animation ---------------- */
  useEffect(() => {
    if (tIndex < titleText.length) {
      const timer = setTimeout(() => {
        setTyped((p) => p + titleText[tIndex]);
        setTIndex(tIndex + 1);
      }, 90);
      return () => clearTimeout(timer);
    }
  }, [tIndex, titleText]);

  /* ---------------- Socket Match Found ---------------- */
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo?._id) return;

    socket.on("match-found", ({ roomId, matchedUserId }) => {
      navigate("/chat", {
        state: {
          roomId,
          matchedUserId,
          currentUserId: userInfo._id,
        },
      });
    });

    return () => {
      socket.off("match-found");
    };
  }, [navigate]);

  /* ---------------- Start Queue ---------------- */
  const startQueue = () => {
    setError("");
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo?._id) {
      navigate("/");
      return;
    }

    setSearching(true);
    socket.emit("join-queue", { userId: userInfo._id });
  };

  return (
    <Box
      minH="100vh"
      color="white"
      p={6}
      bgImage={`url(${starBg})`}
      bgRepeat="repeat"
      bgSize="retain"
      bgPosition="center"
    >
      {/* Animated Title */}
      <Box position="absolute" top="20px" left="20px">
        <Text
          fontSize="4xl"
          fontWeight="bold"
          color="#00f2ff"
          sx={{ animation: `${glowPulse} 2.5s infinite` }}
        >
          {typed}
          <span
            style={{
              animation: `${blinkCursor} 1s steps(1) infinite`,
              marginLeft: "2px",
            }}
          />
        </Text>
      </Box>

      {/* Matchmaking UI */}
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={6} maxW="650px" textAlign="center">
          <Text fontSize="2xl" color="#00f2ff" fontWeight="bold">
            Find someone to chat with
          </Text>

          {searching ? (
            <>
              <Spinner size="xl" color="cyan.400" />
              <Text color="gray.400">
                Looking for someone right now…
              </Text>
            </>
          ) : (
            <Button
              bg="#00f2ff"
              color="black"
              width="260px"
              fontSize="lg"
              boxShadow="0 0 30px #00f2ff"
              _hover={{ boxShadow: "0 0 45px #00f2ff" }}
              onClick={startQueue}
            >
              Start Matchmaking
            </Button>
          )}

          {error && (
            <Text color="red.400" fontSize="sm">
              {error}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default Matchmaking;
