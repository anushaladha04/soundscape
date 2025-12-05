# Soundscape

**Soundscape** is a full-stack web application for discovering and managing live music events in the Los Angeles area. Users can explore concerts, personalize recommendations based on their music preferences, bookmark favorite events, and manage their account settings.

## Features

- **Event Discovery**: Browse upcoming concerts and music events in Los Angeles with search and genre filtering
- **Personalized Recommendations**: Get event recommendations tailored to your music genre preferences
- **Bookmarks**: Save events you're interested in for easy access later
- **User Authentication**: Secure login/signup with JWT tokens, Google OAuth, and password reset via email
- **Genre Preferences**: Set and update your favorite music genres to improve recommendations
- **Responsive Design**: Modern, dark-themed UI that works on desktop devices

## Tech Stack

### Frontend

- **React 19** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework

### Backend

- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service for password resets
- **Ticketmaster API** - Event data source

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** - Either:
  - Local MongoDB installation, OR
  - MongoDB Atlas account (cloud database)
- **Ticketmaster API Key** - Get one at [developer.ticketmaster.com](https://developer.ticketmaster.com/)
- **Google OAuth Credentials** (optional, for Google sign-in) - Get from [Google Cloud Console](https://console.cloud.google.com/)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/anushaladha04/soundscape.git
cd soundscape
```

### 2. Install Dependencies

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server/` directory with the following variables:

```env
# Server Configuration
PORT=5050

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soundscape?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

# External APIs
TICKETMASTER_API_KEY=your-ticketmaster-api-key

# Email Service (for password reset)
EMAIL_FROM="Soundscape <noreply@soundscape.app>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Important Notes:**

- Replace all placeholder values with your actual credentials
- For Gmail SMTP, you need to create an [App Password](https://myaccount.google.com/apppasswords) (requires 2-Step Verification)
- The `MONGODB_URI` should point to your database. If using MongoDB Atlas, include the database name (e.g., `/soundscape`) in the URI
- Keep your `.env` file secure and never commit it to version control

### 4. Database Setup

The application will automatically create the necessary collections when you first run it. No manual database setup is required.

**Initial Data Sync:**
After starting the server, you can populate the database with events from Ticketmaster:

```bash
curl http://localhost:5050/api/events/sync-ticketmaster
```

This fetches upcoming music events in Los Angeles and stores them in MongoDB.

## Running the Application

### Start the Backend Server

```bash
cd server
npm start
```

The server will start on `http://localhost:5050`. You should see:

```
MongoDB connected
Server listening on http://localhost:5050
```

### Start the Frontend Development Server

In a new terminal window:

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite's default port).

### Access the Application

Open your browser and navigate to:

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5050`

## Architecture Diagrams

## ER Diagram
![ER Diagram](ER_Diagram.png)

## Component Diagram
![Component Diagram](Component__Diagram.png)

## Application Flow

1. **User Registration/Login**

   - User signs up or logs in → JWT token generated → Stored in localStorage
   - Token sent with subsequent API requests via `Authorization` header

2. **Event Discovery**

   - User visits Discover page → Fetches events from `/api/events`
   - Can search by artist, filter by genre, paginate results
   - Events stored in MongoDB, synced from Ticketmaster

3. **Personalized Recommendations**

   - User sets genre preferences → Stored in User document
   - Home page fetches recommendations from `/api/recommendations`
   - Backend queries Event collection, filters by user genres, returns random selection

4. **Bookmarking**
   - User clicks bookmark icon → POST to `/api/bookmarks`
   - Bookmark document created linking User and Event
   - User can view all bookmarks on Bookmarks page

## Contributions

This project was developed as a team effort for our COM SCI 35L Class. Key contributors:

- Anusha Ladha
- Sonia Shah
- Ishita Misra
- Samyutha Ayalasomayajula
