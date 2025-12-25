import { Routes, Route } from "react-router-dom";
import Login from "./components/login.jsx";
import Chat from "./components/chat.jsx";
import Profile from "./components/profile.jsx";
import Signup from "./components/signup.jsx";
import Matchmaking from "./components/matchmaking.jsx";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<ProtectedRoute>
            <Chat />
          </ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute>
            <Profile />
          </ProtectedRoute>} />
          <Route path="/matchmaking" element={<ProtectedRoute>
            <Matchmaking />
          </ProtectedRoute>} />
        {/* other routes */}
      </Routes>
      </BrowserRouter>
  );
}

export default App;