# CampusWhispher 🌙

[🌐 Visit CampusWhisper Live](https://campus-whisper.vercel.app)

CampusWhispher is a real-time, anonymous chat platform built for college students to connect effortlessly while maintaining privacy and safety. The application allows users to match with students with same interests, enabling both localized and global conversations without revealing personal identities.

---

## 🚀 Features

- 🔐 Secure authentication using JWT
- 🎓 Points based matchmakung
- 💬 Typing indicators
- ⚡ Real-time 1-to-1 chat using Socket.IO
- ⏳ Time-bound chat sessions (5 minutes)
- 🔄 Mutual chat extension (5 or 10 minutes)
- 🚪 Synchronized chat exit for both users
- 🚨 Report system with safe exit
- 📱 Responsive and minimal UI using Chakra UI

---

## 🛠 Tech Stack

### Frontend

- React (Vite)
- Chakra UI
- Socket.IO Client
- Axios

### Backend

- Node.js
- Express.js
- Socket.IO
- JWT Authentication

### Database

- MongoDB (Mongoose)

---

## 🧠 How It Works

1. Users sign up and complete a short profile.
2. Users choose the matchmaking option.
3. A real-time socket-based queue pairs two users instantly.
4. Both users join a private chat room.
5. Each chat runs on a countdown timer with optional mutual extension.
6. Either user can end or report the chat safely, exiting both participants.

---

## 🔒 Privacy & Safety

- No personal identities are revealed in chat
- Chats are session-based and not permanently stored
- Passwords are encrypted
- Report option immediately exits both users
- Secure token-based authentication
- Environment variables used for sensitive data

---

---

## 🌐 Live Website

[https://campus-whisper.vercel.app/](https://campus-whisper.vercel.app)

---

## 📦 Installation (Local Setup)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/campuswhisper.git
cd campuswhisper
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the backend server:

```bash
npm start
# or
node server.js
```

### 3. Frontend Setup

Open a new terminal, then:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or as indicated in the terminal).

---

**Note:**

- Make sure MongoDB is running and accessible.
- The backend should be running before using the frontend.
- For production, configure environment variables and use a process manager (e.g., PM2) for the backend.

---

## 🛠️ Troubleshooting

- **Frontend/Backend not connecting:**
  - Ensure both servers are running and the backend URL is correctly set in the frontend (check for proxy or API base URL).
- **MongoDB connection errors:**
  - Verify your `MONGO_URI` in the backend `.env` file and ensure MongoDB is running and accessible.
- **Port conflicts:**
  - Make sure ports 5000 (backend) and 5173 (frontend) are free or update them in the config files.
- **Socket.IO issues:**
  - Confirm both frontend and backend use the same Socket.IO version and the server is reachable.
- **Environment variable issues:**
  - Double-check your `.env` files for typos or missing variables.

If you encounter other issues, please check the project issues page or reach out for support.

---

## 📫 Contact / Support

- For questions, suggestions, or support, please open an issue on the [GitHub repository](https://github.com/your-username/campuswhisper/issues).
- You can also reach out via email: yegi.2992@gmail.com

We welcome feedback and contributions!
