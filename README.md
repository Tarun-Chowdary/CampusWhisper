# CampusWhispher 🌙

[🌐 Visit CampusWhisper Live](https://campus-whisper.vercel.app/matchmaking)

CampusWhispher is a real-time, anonymous chat platform built for college students to connect effortlessly while maintaining privacy and safety. The application allows users to match either with students from their own college or with students from any college, enabling both localized and global conversations without revealing personal identities.

---

## 🚀 Features

- 🔐 Secure authentication using JWT
- 🎓 College-based matchmaking (**My College**)
- 🌍 Global matchmaking (**Any College**)
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
- Report option immediately exits both users
- Secure token-based authentication
- Environment variables used for sensitive data

---

---

## 🌐 Live Website

[https://campus-whisper.vercel.app/matchmaking](https://campus-whisper.vercel.app/matchmaking)

---

## 📦 Installation (Local Setup)

### Clone the repository

```bash
git clone https://github.com/your-username/campuswhisper.git
```
