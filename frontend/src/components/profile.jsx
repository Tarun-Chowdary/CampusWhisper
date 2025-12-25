import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  useToast,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import axios from "axios";
import starBg from "../assets/bg.jpg";

/* ------------------ Animations ------------------ */
const glowPulse = keyframes`
  0% { text-shadow: 0 0 5px #00f2ff; }
  50% { text-shadow: 0 0 25px #00f2ff; }
  100% { text-shadow: 0 0 5px #00f2ff; }
`;

/* ------------------ Questions ------------------ */
const questions = [
  {
    question: "Select your gender",
    options: ["Male", "Female", "Prefer not to say"],
    multi: false,
  },
  {
    question: "Which college are you from?",
    options: ["IIEST Shibpur", "Other (Type your college)"],
    multi: false,
    isCollege: true,
  },
  {
    question: "What are your interests?",
    options: [
      "Tech",
      "Movies",
      "Music",
      "Sports",
      "Gaming",
      "Anime",
      "Fitness",
      "Art & Design",
      "Reading",
    ],
    multi: true,
  },
  {
    question: "What kind of conversations do you enjoy?",
    options: [
      "Deep talks",
      "Funny & random",
      "Chill & casual",
      "Debates",
      "Late-night talks",
      "Voice chats",
      "Text only",
      "Anything",
    ],
    multi: true,
  },
  {
    question: "How do you spend your free time?",
    options: [
      "Exploring",
      "Scrolling",
      "Watching shows",
      "Gaming",
      "Sleeping",
      "Hanging out",
      "Learning",
      "Music",
    ],
    multi: true,
  },
  {
    question: "Your campus vibe is…",
    options: [
      "Very social",
      "Selective",
      "Low-key",
      "Event lover",
      "Mostly indoors",
      "Quiet observer",
      "Known by everyone",
      "Depends on mood",
    ],
    multi: false,
  },
  {
    question: "When are you most active?",
    options: [
      "Early morning",
      "Morning",
      "Afternoon",
      "Evening",
      "Night",
      "Late night",
      "Random",
      "Always online",
    ],
    multi: true,
  },
  {
    question: "Choose what fits you best",
    options: [
      "Introvert",
      "Extrovert",
      "Ambivert",
      "Overthinker",
      "Calm",
      "Chaotic 😈",
      "Curious",
      "Focused",
    ],
    multi: true,
  },
  {
    question: "How do you deal with stress?",
    options: [
      "Talking",
      "Music",
      "Isolation",
      "Work",
      "Games",
      "Sleep",
      "Exercise",
      "Distractions",
    ],
    multi: true,
  },
  {
    question: "What are you looking for here?",
    options: [
      "New friends",
      "Casual chats",
      "Long-term connections",
      "Someone to vibe with",
      "Anonymous talks",
      "Late-night chats",
      "Supportive people",
      "Just exploring",
    ],
    multi: true,
  },
];

const Profile = () => {
  const titleText = "CampusWhispher";
  const [typed, setTyped] = useState("");
  const [tIndex, setTIndex] = useState(0);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [otherCollege, setOtherCollege] = useState("");

  const navigate = useNavigate();
  const toast = useToast();

  /* ------------------ Typing animation ------------------ */
  useEffect(() => {
    if (tIndex < titleText.length) {
      const timer = setTimeout(() => {
        setTyped((p) => p + titleText[tIndex]);
        setTIndex(tIndex + 1);
      }, 90);
      return () => clearTimeout(timer);
    }
  }, [tIndex]);

  /* ------------------ Option toggle ------------------ */
  const toggleOption = (opt) => {
    const q = questions[current];
    setAnswers((prev) => {
      const prevAns = prev[current] || [];
      if (q.multi) {
        return {
          ...prev,
          [current]: prevAns.includes(opt)
            ? prevAns.filter((o) => o !== opt)
            : [...prevAns, opt],
        };
      }
      return { ...prev, [current]: [opt] };
    });
  };

  const isAnswered =
    answers[current]?.length > 0 &&
    !(
      questions[current]?.isCollege &&
      answers[current]?.includes("Other (Type your college)") &&
      otherCollege.trim() === ""
    );

  /* ------------------ SAVE MATCHMAKING TO BACKEND ------------------ */
  const saveMatchmakingToDB = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const gender = answers[0]?.[0];

      const college =
        answers[1]?.[0] === "Other (Type your college)"
          ? otherCollege
          : answers[1]?.[0];

      const interests = answers[2] || [];

      const preferences = Object.keys(answers)
        .filter((q) => q >= 3)
        .flatMap((q) => answers[q]);

      await axios.post(
        "http://localhost:5000/api/users/matchmaking",
        { gender, college, interests, preferences },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Profile completed successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      navigate("/matchmaking");
    } catch (error) {
      toast({
        title: "Failed to save profile",
        description: error.response?.data?.message,
        status: "error",
      });
    }
  };

  return (
    <Box
      minH="100vh"
      bgImage={`url(${starBg})`}
      bgRepeat="repeat"
      bgSize="retain"
      color="white"
      p={6}
    >
      {/* Title */}
      <Box position="absolute" top="20px" left="20px">
        <Text
          fontSize="4xl"
          fontWeight="bold"
          color="#00f2ff"
          animation={`${glowPulse} 2.5s infinite`}
        >
          {typed}
        </Text>
      </Box>

      {/* Questions Flow */}
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        {current < questions.length ? (
          <VStack spacing={6} maxW="650px" textAlign="center">
            <Text fontSize="2xl" color="#00f2ff" fontWeight="bold">
              {questions[current].question}
            </Text>

            <HStack wrap="wrap" spacing={4} justify="center">
              {questions[current].options.map((opt) => {
                const selected = answers[current]?.includes(opt);
                return (
                  <Button
                    key={opt}
                    variant="outline"
                    borderColor="#00f2ff"
                    color={selected ? "black" : "#00f2ff"}
                    bg={selected ? "#00f2ff" : "transparent"}
                    boxShadow={selected ? "0 0 25px #00f2ff" : "none"}
                    _hover={{ boxShadow: "0 0 30px #00f2ff" }}
                    onClick={() => {
                      toggleOption(opt);
                      if (opt !== "Other (Type your college)") {
                        setOtherCollege("");
                      }
                    }}
                  >
                    {opt}
                  </Button>
                );
              })}
            </HStack>

            {questions[current]?.isCollege &&
              answers[current]?.includes("Other (Type your college)") && (
                <Input
                  placeholder="Enter full college name"
                  value={otherCollege}
                  onChange={(e) => setOtherCollege(e.target.value)}
                  bg="black"
                  borderColor="#00f2ff"
                  color="#00f2ff"
                />
              )}

            <Button
              bg="#00f2ff"
              color="black"
              px={8}
              isDisabled={!isAnswered}
              boxShadow="0 0 20px #00f2ff"
              _hover={{ boxShadow: "0 0 40px #00f2ff" }}
              onClick={() => setCurrent((p) => p + 1)}
            >
              Next
            </Button>
          </VStack>
        ) : (
          <VStack spacing={4}>
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="#00f2ff"
              animation={`${glowPulse} 2s infinite`}
            >
              Profile Completed 🎉
            </Text>
            <Text color="gray.300">
              Your CampusWhispher profile is ready.
            </Text>
            <Button
              bg="#00f2ff"
              color="black"
              boxShadow="0 0 30px #00f2ff"
              _hover={{ boxShadow: "0 0 45px #00f2ff" }}
              onClick={saveMatchmakingToDB}
            >
              Enter CampusWhispher
            </Button>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
