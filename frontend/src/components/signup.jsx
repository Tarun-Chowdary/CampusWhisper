import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
  Box,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import starBg from "../assets/bg.jpg";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const submitHandler = async () => {
    setPicLoading(true);

    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast({
        title: "Passwords do not match",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/signup",
        { name, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Signup successful 🎉",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      // store user info + token
      localStorage.setItem("userInfo", JSON.stringify(data));

      setPicLoading(false);
      navigate("/Profile");
    } catch (error) {
      toast({
        title:
          error.response?.data?.message ||
          "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      color="white"
      p={6}
      bgImage={`url(${starBg})`}
      bgRepeat="repeat"
      bgSize="cover"
      bgPosition="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        p={6}
        rounded="lg"
        boxShadow="0 0 20px #00f2ff"
        width="350px"
        bg="rgba(0,0,0,0.75)"
      >
        <Text
          color="#00f2ff"
          fontSize="4xl"
          fontWeight="bold"
          textAlign="center"
          mb={4}
        >
          SIGNUP
        </Text>

        <VStack spacing="5px">
          <FormControl isRequired>
            <FormLabel color="cyan.300">Name</FormLabel>
            <Input
              bg="gray.900"
              color="white"
              borderColor="cyan.500"
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="cyan.300">Email</FormLabel>
            <Input
              type="email"
              bg="gray.900"
              color="white"
              borderColor="cyan.500"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="cyan.300">Password</FormLabel>
            <InputGroup>
              <Input
                type={show ? "text" : "password"}
                bg="gray.900"
                color="white"
                borderColor="cyan.500"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  bg="cyan.500"
                  onClick={handleClick}
                >
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="cyan.300">Confirm Password</FormLabel>
            <Input
              type={show ? "text" : "password"}
              bg="gray.900"
              color="white"
              borderColor="cyan.500"
              placeholder="Confirm password"
              onChange={(e) => setConfirmpassword(e.target.value)}
            />
          </FormControl>

          <Button
            bg="cyan.500"
            color="black"
            width="100%"
            mt={4}
            isLoading={picLoading}
            _hover={{ bg: "cyan.400" }}
            onClick={submitHandler}
          >
            Sign Up
          </Button>

          <Button
            width="100%"
            mt={2}
            variant="outline"
            color="#00f2ff"
            borderColor="#00f2ff"
            onClick={() => navigate("/")}
          >
            Go to Login Page
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Signup;
