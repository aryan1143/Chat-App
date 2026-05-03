# Yappy Talk - Real-Time Chat Application

A modern chat application built with React and Node.js that lets you connect with friends in real-time. Message instantly, see when your friends are online, and get notified of new conversations.

## What's This All About?

Yappy Talk is a full-featured chat app where you can:

- **Message friends** - Send and receive messages instantly with real-time updates
- **See online status** - Know exactly when your friends are online or when they were last active
- **Typing indicators** - See when someone's typing a message to you
- **Read receipts** - Know if your messages have been read
- **Upload profile pictures** - With built-in image cropping and optimization
- **Manage connections** - Add friends and manage your friend list
- **Notifications** - Get push notifications for new messages even when the app is closed
- **Privacy controls** - Toggle your online status visibility and read receipts
- **Dark & Light themes** - Customize how the app looks

## Tech Stack

### Backend

- **Node.js + Express** - Fast and scalable server
- **MongoDB** - Store all your messages, users, and connections
- **Redis** - Keep track of who's online in real-time (Redis Cloud)
- **Socket.io** - Real-time bidirectional communication
- **Firebase Admin SDK** - Send push notifications
- **ImageKit** - Image optimization and hosting
- **JWT** - Secure authentication with tokens
- **bcryptjs** - Password hashing and security

### Frontend

- **React 19** - Modern UI with hooks
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Beautiful, responsive styling with DaisyUI
- **Zustand** - Simple and effective state management
- **Socket.io Client** - Real-time message and status updates
- **Firebase SDK** - Push notifications and messaging
- **React Router** - Navigation between pages
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Nice notification toasts

## Project Structure

```
Chat-App/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Business logic (auth, messages, connections)
│   │   ├── models/             # MongoDB schemas (User, Message, Connection)
│   │   ├── routes/             # API endpoints
│   │   ├── lib/                # Helper utilities and configs
│   │   │   ├── db.js           # MongoDB connection
│   │   │   ├── socket.js       # Socket.io setup and events
│   │   │   ├── firebase.js     # Firebase notifications
│   │   │   ├── imagekit.js     # Image optimization
│   │   │   ├── utils.js        # Helper functions
│   │   │   └── firebaseAdmin.js # Firebase service account setup
│   │   ├── middleware/         # Auth middleware
│   │   └── index.js            # Server entry point
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Full page components (Login, Chat, etc)
│   │   ├── store/              # Zustand state management
│   │   ├── lib/                # Utilities and configs
│   │   │   ├── axios.js        # API client setup
│   │   │   ├── firebase.js     # Firebase config
│   │   │   └── utils.js        # Helper functions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # App entry point
│   ├── public/
│   │   ├── firebase-messaging-sw.js  # Service worker for notifications
│   │   └── favicon
│   ├── .env.example            # Environment variables template
│   └── package.json
│
└── README.md (you are here)
```

## Getting Started

### Prerequisites

Make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud Atlas)
- **Redis** (local or Redis Cloud)
- **Firebase Project** (for notifications)
- **ImageKit Account** (for image hosting)
- **npm** or **yarn**

### Backend Setup

1. **Clone and navigate to backend:**

```bash
cd backend
npm install
```

2. **Create `.env` file** (copy from `.env.example`):

```env
# Server
PORT=3001
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chat-app

# Redis Cloud
REDIS_URL=redis://default:password@host:port
REDIS_TLS=false

# Firebase Admin SDK (get this from Firebase Console)
GCP_PROJECT_ID=your-project-id
GCP_PRIVATE_KEY_ID=xxx
GCP_PRIVATE_KEY=xxx
GCP_CLIENT_EMAIL=xxx
GCP_CLIENT_ID=xxx
GCP_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GCP_TOKEN_URI=https://oauth2.googleapis.com/token
GCP_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GCP_CLIENT_X509_CERT_URL=xxx
GCP_UNIVERSE_DOMAIN=googleapis.com

# ImageKit (for profile pictures)
IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

3. **Start the backend:**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs on `http://localhost:3001`

### Frontend Setup

1. **Open new terminal, navigate to frontend:**

```bash
cd frontend
npm install
```

2. **Create `.env` file** (copy from `.env.example`):

```env
# API
VITE_API_URL=http://localhost:3001

# Firebase (get from Firebase Console)
VITE_API_KEY=xxx
VITE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_PROJECT_ID=your-firebase-project-id
VITE_STORAGE_BUCKET=your-project.appspot.com
VITE_MESSAGING_SENDER_ID=xxx
VITE_APP_ID=xxx
VITE_MEASUREMENT_ID=xxx
```

3. **Start the frontend:**

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Frontend runs on `http://localhost:5173`

## How It Works

### Real-Time Features

- **Socket.io** handles all real-time events:
  - New messages
  - Typing indicators
  - Online/offline status
  - Read receipts
  - Friend online notifications

### Message Flow

1. User sends a message → Stored in MongoDB
2. Socket.io emits event to recipient → Instant delivery
3. Recipient marks message as read → Status updated
4. Firebase sends push notification (if app is closed)

### Authentication

- User signs up with email and password
- Password is hashed with bcryptjs (salted 10 times)
- JWT token generated and stored in secure HTTP-only cookies
- Every API request verifies the token

### Real-Time User Status

- When user connects: Added to Redis online set
- When user types: Event sent to recipient
- When user goes offline: Removed from Redis, `lastOnline` timestamp saved
- Friends list shows online friends in real-time

## Key Features Explained

### Profile Pictures

- Upload images directly from your device
- Built-in cropper to adjust the image
- ImageKit automatically optimizes and hosts the image
- Fast loading on all devices

### Privacy Settings

- **Last seen and online** - Toggle whether others can see when you're online
- **Read receipts** - Control if others can see if you've read messages
- Settings saved immediately and sync across all devices

### Notifications

- Push notifications for new messages
- Works even when app is closed (via Service Worker)
- Notifications are smart - no duplicates if you're actively using the app

### Responsive Design

- Beautiful UI with Tailwind CSS
- DaisyUI components for consistency
- Works perfectly on mobile, tablet, and desktop
- Dark mode support

## API Endpoints

### Auth

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check if user is authenticated
- `PUT /api/auth/update-profile` - Update profile picture or name

### Messages

- `GET /api/message/messages/:userId` - Get messages with a user (with pagination)
- `POST /api/message/send` - Send a new message
- `PUT /api/message/update-status` - Mark message as read

### Connections (Friends)

- `GET /api/connection/friends` - Get your friend list
- `POST /api/connection/add-friend` - Send friend request
- `GET /api/connection/get-requests` - Get pending friend requests
- `PUT /api/connection/accept-request` - Accept friend request
- `DELETE /api/connection/remove-friend/:friendId` - Remove a friend

## Deployment

Check out `DEPLOYMENT.md` for step-by-step deployment instructions to Heroku, Railway, or any Node.js hosting.

### Quick Deployment Tips

1. Set all environment variables on your hosting platform
2. Build the frontend: `npm run build`
3. Backend should serve the frontend's `dist` folder
4. Use production-grade MongoDB (Atlas) and Redis Cloud
5. Set `CLIENT_URL` to your actual frontend domain
6. Make sure CORS is configured correctly

## Development

### Running Tests

```bash
# Run linter
cd frontend
npm run lint
```

### Code Structure Notes

- **Controllers** - Handle business logic for routes
- **Models** - Define database schemas
- **Middleware** - Verify authentication before protected routes
- **Store** - Zustand stores for React state management
- **Hooks** - Custom React hooks for reusable logic

### Common Issues & Fixes

**"Can't connect to MongoDB"**

- Check your connection string in `.env`
- Make sure IP is whitelisted on MongoDB Atlas

**"Redis connection refused"**

- Verify the Redis Cloud URL is correct and matches your database protocol
- If you see `ERR_SSL_WRONG_VERSION_NUMBER`, set `REDIS_TLS=false`
- If your database requires TLS, set `REDIS_TLS=true`

**"Firebase notifications not working"**

- Check service worker is registered
- Verify Firebase credentials in `.env`
- Browser needs permission to show notifications

**"Messages not real-time"**

- Check Socket.io is connected (look in browser DevTools)
- Verify `CLIENT_URL` in backend `.env` matches frontend domain
- Check CORS configuration

## Performance

- MongoDB indexes on frequently queried fields
- Redis for fast online/offline lookups
- Pagination for message history (load older messages as user scrolls)
- Image optimization with ImageKit
- Vite for fast development and optimized production builds

## Future Ideas

- Voice/video calls
- Group chats
- Message reactions and emojis
- User search across the platform
- Message search within conversations
- Typing bubbles animation
- User status (online, away, do not disturb)
- Two-factor authentication

## Contributing

Feel free to fork, modify, and improve this project. Some areas that could use work:

- Better error handling and validation
- More comprehensive tests
- Performance optimization for large message histories
- Mobile app version

## License

ISC

---

**Made with ❤️ and lots of ☕**

Have fun chatting!
