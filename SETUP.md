# BlockVerse Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (v6 or higher) - Must be running locally or provide a connection string
3. **pnpm** package manager

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- Authentication: `bcryptjs`, `jsonwebtoken`
- Database: `mongodb`, `mongoose`
- Frontend dependencies

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
# Server Configuration
MONGODB_URI=mongodb://localhost:27017/blockverse
PORT=3000
JWT_SECRET=your-very-secure-random-secret-key-change-in-production
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
net start MongoDB
```

**Or use Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### 4. Start the Development Server

```bash
pnpm dev
```

This starts:
- Vite development server (frontend)
- Express backend server with hot reload
- Both run concurrently

The application will be available at: **http://localhost:3000**

## Testing Authentication

### Register a New User

1. Navigate to http://localhost:3000
2. Click the "Register" tab
3. Enter:
   - Email: test@example.com
   - Password: test123 (minimum 6 characters)
   - Confirm Password: test123
4. Click "Register"

You should see:
- Success toast notification
- Redirect to character creation screen

### Check Server Logs

The server console will show:
```
🔵 Registration attempt: { email: 'test@example.com' }
✅ User created successfully: test@example.com
✅ Token generated, sending response
```

### Common Issues

#### "Cannot connect to MongoDB"
- **Problem:** MongoDB is not running
- **Solution:** Start MongoDB using the commands above

#### "Register button does nothing"
- **Problem:** Server is not running or API call failing
- **Solution:**
  1. Check server console for errors
  2. Open browser DevTools (F12) → Network tab
  3. Click Register and check for network requests
  4. Look for error messages in Console tab

#### "Email already registered"
- **Problem:** You've already registered with this email
- **Solution:** Try a different email or use the Login tab

#### "Something went wrong"
- **Problem:** Server error (check server logs)
- **Solution:**
  1. Check MongoDB is running
  2. Check `.env` file is configured
  3. Check server console for error details

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

### Character (Protected - requires JWT)
- `POST /api/character` - Create character for authenticated user

## Project Structure

```
coblox/
├── client/               # Frontend (React + Vite)
│   └── src/
│       └── pages/
│           ├── Login.tsx           # Login & Registration
│           ├── CharacterCreate.tsx # Character creation
│           └── Profile.tsx         # User profile
├── server/               # Backend (Express + MongoDB)
│   ├── db/
│   │   ├── index.ts              # MongoDB connection
│   │   └── models/User.ts        # User schema
│   ├── middleware/
│   │   └── auth.ts               # JWT authentication
│   ├── routes/
│   │   ├── auth.ts               # Login/Register endpoints
│   │   └── character.ts          # Character endpoints
│   ├── utils/
│   │   └── jwt.ts                # JWT utilities
│   └── index.ts                  # Server entry point
└── .env                   # Environment variables (create this)
```

## Troubleshooting

### Check if MongoDB is Running

```bash
# Try connecting with mongo shell
mongosh mongodb://localhost:27017/blockverse
```

### Check if Server is Running

Open http://localhost:3000/api/auth/register in your browser.
You should see: `{"error":"Email and password are required"}`

### View Server Logs

The server logs all authentication attempts with emojis:
- 🔵 = Attempt started
- ✅ = Success
- ❌ = Error/validation failed

### Clear Browser Data

If you're having token issues:
1. Open DevTools (F12)
2. Application tab → Local Storage
3. Delete the `token` entry
4. Refresh and try again

## Need Help?

- Check server console for detailed logs
- Check browser console (F12) for frontend errors
- Ensure MongoDB is running
- Verify `.env` file exists and is configured
