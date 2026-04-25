# Video Call App - Project Documentation

## Overview

A real-time video calling application built with Next.js 16 and Agora RTC SDK. The app enables users to create or join video rooms using a simple Room ID system, supporting multi-party video and audio communication with Bengali language UI elements.

## Tech Stack

### Core Technologies
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Runtime**: React 19.2.3
- **Video SDK**: Agora RTC SDK NG 4.24.2
- **Real-time Messaging**: Pusher (WebSocket-based chat)

### Styling & UI
- **CSS Framework**: Tailwind CSS 4
- **Icons**: Lucide React 0.575.0
- **Fonts**: Geist Sans & Geist Mono

### Development Tools
- **Linter**: ESLint 9 with Next.js config
- **PostCSS**: Tailwind PostCSS 4

## Project Architecture

### Directory Structure

```
video-call-app/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page (join/create room)
│   ├── layout.tsx                # Root layout with fonts & viewport meta
│   ├── globals.css               # Global styles
│   ├── favicon.ico               # App icon
│   ├── api/
│   │   └── send-message/
│   │       └── route.ts          # Pusher message API endpoint
│   └── room/[roomId]/
│       └── page.tsx              # Dynamic room page
├── components/
│   ├── VideoCall.tsx             # Main video call component
│   ├── VideoPlayer.tsx           # Individual video player
│   ├── ChatPanel.tsx             # Real-time chat interface
│   └── PermissionModal.tsx       # Camera/mic permission modal
├── hooks/
│   ├── useAgora.ts               # Agora SDK integration hook
│   └── useAgoraChat.ts           # Pusher chat integration hook
├── public/                       # Static assets
├── .env.local                    # Environment variables (not in repo)
├── .env.example                  # Environment template
└── package.json                  # Dependencies
```

## Core Features

### 1. Room Management
- **Join Room**: Users can join existing rooms with a Room ID
- **Create Room**: Generate unique 6-character Room IDs (uppercase alphanumeric)
- **Shareable Links**: Auto-generated links for easy room sharing
- **Name Entry**: Required username before joining

### 2. Video Communication
- **Real-time Video**: WebRTC-based video streaming via Agora
- **Real-time Audio**: Synchronized audio communication
- **Multi-party Calls**: Supports multiple participants per room with adaptive grid layout
- **Automatic Connection**: Detects when remote users join/leave

### 3. Media Controls
- **Microphone Toggle**: Mute/unmute audio
- **Camera Toggle**: Turn video on/off
- **Screen Sharing**: Share your screen, window, or tab with other participants
- **Leave Call**: Exit room and return to home
- **Visual Feedback**: Icons and UI states reflect control status

### 4. Real-time Chat
- **Text Messaging**: Send and receive messages during video calls
- **Pusher Integration**: WebSocket-based real-time message delivery
- **Chat Panel**: Collapsible side panel with message history
- **Unread Badge**: Notification count for unread messages when chat is closed
- **Message Indicators**: Sender name, timestamp, and read status
- **Auto-scroll**: Automatically scrolls to latest messages
- **Bengali UI**: Chat interface with Bengali placeholders

### 5. User Experience
- **Loading States**: Spinner during camera/mic initialization
- **Error Handling**: Categorized error types (permission, device, unknown) with contextual guidance
- **Permission Modal**: Guides users through camera/mic permissions with retry support
- **Waiting State**: Shows placeholder when no remote users have joined
- **Live Indicator**: Visual "Live" badge during active calls
- **Responsive Design**: Works on desktop and mobile devices
- **Viewport Optimization**: Configured for mobile with `device-width`, no user scaling, and `viewport-fit: cover`

## Component Breakdown

### 1. Home Page (`app/page.tsx`)

**Purpose**: Entry point for joining or creating rooms

**Features**:
- Tab-based interface (Join / Create)
- Room ID generation algorithm
- Link copying functionality
- Form validation with Bengali error messages
- Navigation to room pages

**Key Functions**:
- `generateRoomId()`: Creates random 6-char uppercase ID
- `handleJoin()`: Validates and navigates to room
- `handleCreate()`: Generates room link
- `handleCopy()`: Copies link to clipboard

### 2. Room Page (`app/room/[roomId]/page.tsx`)

**Purpose**: Dynamic route for video call rooms

**Features**:
- URL parameter extraction (roomId) via `use()` for async params
- Query parameter handling (name)
- Name confirmation flow
- Suspense boundary for loading
- Integration with VideoCall component

**Components**:
- `RoomContent`: Handles name entry and VideoCall rendering
- Loading fallback with spinner

### 3. VideoCall Component (`components/VideoCall.tsx`)

**Purpose**: Main video call interface and controls

**Features**:
- Agora hook integration for video/audio
- Pusher chat integration via useAgoraChat hook
- Local and remote video display with adaptive grid layout
- Control buttons (mic, camera, screen share, chat, leave)
- Screen sharing indicator badge
- Unread message count badge on chat button
- Connection status display with participant count
- Error and loading states with permission modal
- iOS screen share detection (hides button on unsupported devices)

**State Management**:
- Uses `useAgora` hook for all Agora functionality
- Uses `useAgoraChat` hook for chat functionality
- Router for navigation
- Conditional rendering based on connection state

### 4. VideoPlayer Component (`components/VideoPlayer.tsx`)

**Purpose**: Individual video stream renderer

**Features**:
- Plays local or remote video tracks
- Camera-off fallback (avatar with initial)
- User name display
- Local/remote badge

**Props**:
- `videoTrack`: Agora video track object
- `isLocal`: Boolean for local/remote distinction
- `userName`: Display name
- `isCameraOff`: Camera state

### 5. ChatPanel Component (`components/ChatPanel.tsx`)

**Purpose**: Real-time text chat interface

**Features**:
- Message display with sender identification
- Local vs remote message styling
- Auto-scroll to latest messages
- Keyboard shortcuts (Enter to send)
- Empty state handling
- Timestamp formatting

**Props**:
- `messages`: Array of Message objects
- `onSendMessage`: Callback for sending messages
- `isOpen`: Chat panel visibility state
- `onClose`: Callback to close chat panel

### 6. PermissionModal Component (`components/PermissionModal.tsx`)

**Purpose**: Guide users through camera and microphone permissions

**Features**:
- Categorized error handling (permission, device, unknown)
- Step-by-step permission instructions per error type
- Browser-specific guidance
- Visual feedback for permission status
- Retry mechanism for denied permissions

### 7. useAgora Hook (`hooks/useAgora.ts`)

**Purpose**: Encapsulates all Agora SDK logic

**Responsibilities**:
- Client initialization
- Channel joining (uses userName as UID)
- Track creation (audio/video/screen)
- Publishing local tracks
- Subscribing to remote users (supports multiple)
- Event handling (user-published, user-unpublished, user-left)
- Media control (mute, camera toggle, screen share)
- Track switching between camera and screen
- Categorized error detection (permission / device / unknown)
- Retry connection support
- Cleanup on unmount

**Return Values**:
- `localVideoTrack`: Local video track
- `remoteUsers`: Array of remote user objects with tracks
- `isJoined`: Connection status
- `isMuted`: Microphone state
- `isCameraOff`: Camera state
- `isScreenSharing`: Screen sharing state
- `isLoading`: Initialization state
- `error`: Error message
- `errorType`: Categorized error type (`"permission"` | `"device"` | `"unknown"` | `null`)
- `toggleMic()`: Mute/unmute function
- `toggleCamera()`: Camera on/off function
- `toggleScreenShare()`: Start/stop screen sharing
- `leaveChannel()`: Disconnect function
- `retryConnection()`: Re-initialize connection
- `client`: Agora RTC client reference

### 8. useAgoraChat Hook (`hooks/useAgoraChat.ts`)

**Purpose**: Encapsulates Pusher chat functionality

**Responsibilities**:
- Pusher client initialization
- Channel subscription (per room)
- Real-time message listening
- Message sending via API
- Connection state management
- Automatic cleanup on unmount

**Parameters**:
- `channelName`: Room ID for chat channel
- `userName`: Current user's display name

**Return Values**:
- `messages`: Array of chat messages
- `sendMessage()`: Function to send new messages
- `isConnected`: Pusher connection status

**Message Flow**:
1. User types message in ChatPanel
2. `sendMessage()` called with text
3. Message sent to `/api/send-message` endpoint
4. Backend triggers Pusher event
5. All connected clients receive message
6. Message added to local state and displayed

## Data Flow

### Joining a Room

1. User enters name and Room ID on home page
2. Clicks "Join করুন" button
3. Navigates to `/room/[roomId]?name=[userName]`
4. Room page extracts roomId and name
5. VideoCall component receives channelName and userName
6. useAgora hook initializes Agora client
7. Requests camera/mic permissions
8. Creates local audio/video tracks
9. Joins Agora channel with Room ID (userName as UID)
10. Publishes local tracks
11. Listens for remote user events
12. Renders video players in adaptive grid

### Creating a Room

1. User enters name on home page
2. Clicks "Link তৈরি করুন" button
3. App generates random 6-char Room ID
4. Creates shareable link
5. User copies link or starts call
6. Follows same flow as joining

### Remote User Connection

1. Remote user joins same channel
2. Agora fires "user-published" event
3. Local client subscribes to remote tracks
4. Remote video/audio tracks added to remoteUsers array
5. VideoPlayer renders remote stream in grid
6. UI updates to show participant count

## Environment Configuration

### Required Variables

```bash
# Agora Video/Audio
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id_here

# Pusher Chat (all required for chat functionality)
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
```

### Optional Variables

```bash
NEXT_PUBLIC_AGORA_TOKEN=your_token_for_production
```

**Note**: 
- Agora token authentication is recommended for production but optional for testing
- All Pusher credentials are required for chat to work
- Get Pusher credentials from https://pusher.com (free tier available)

## Agora Integration Details

### SDK Configuration

- **Mode**: RTC (Real-Time Communication)
- **Codec**: VP8
- **Channel Type**: Communication (not broadcast)

### Events Handled

- `user-published`: Remote user starts publishing media
- `user-unpublished`: Remote user stops publishing media
- `user-left`: Remote user leaves channel

### Track Management

- **Local Tracks**: Created via `AgoraRTC.createMicrophoneAndCameraTracks()`
- **Screen Tracks**: Created via `AgoraRTC.createScreenVideoTrack()`
- **Remote Tracks**: Received via subscription (supports multiple remote users)
- **Track Switching**: Seamlessly switches between camera and screen share
- **Cleanup**: Tracks closed on component unmount

## UI/UX Design

### Color Scheme

- **Background**: Gray-950 (dark)
- **Cards**: Gray-900
- **Inputs**: Gray-800
- **Primary**: Blue-600
- **Error**: Red-400/600
- **Success**: Green-400/600

### Typography

- **Sans**: Geist Sans (variable font)
- **Mono**: Geist Mono (for Room IDs)

### Language

- **Primary**: Bengali (Bangla)
- **Technical Terms**: English (e.g., "Room ID", "Live")

### Responsive Behavior

- **Mobile**: Single column video layout, `100dvh` viewport height
- **Desktop**: Adaptive grid (2-col for 2 users, 3-col for 3+ users)
- **Controls**: Always centered at bottom
- **Chat Panel**: Fixed position overlay (right side, 320px wide)

## Video Grid Layout

The video grid adapts based on participant count:
- **Solo (no remote users)**: Single centered video, max-width 3xl
- **2 participants (1 remote)**: 1-col on mobile, 2-col on desktop
- **3 participants (2 remote)**: 2-col on mobile, 3-col on desktop with local spanning 2 cols on mobile
- **4+ participants**: 2-col on mobile, 3-col on desktop auto-rows

## Known Issues & Limitations

1. **No Token Auth**: Uses null token for Agora (testing mode)
2. **No Recording**: Call recording not implemented
3. **Browser Compatibility**: Requires modern browsers with WebRTC support
4. **Screen Share**: Camera is disabled while screen sharing is active
5. **iOS Limitation**: Screen sharing is not supported on iOS devices (Safari/Chrome on iPhone/iPad)
6. **Chat Persistence**: Messages are not stored; lost when users leave
7. **No Message History**: New joiners don't see previous messages
8. **Remote User Names**: Remote users display as "User {uid}" instead of their actual name

## Security Considerations

### Current State (Development)
- No token authentication
- App ID exposed in client
- No user authentication
- Public room access

### Production Recommendations
1. Implement Agora token server
2. Add user authentication
3. Secure room creation/access
4. Rate limiting for room creation
5. Environment variable protection
6. HTTPS enforcement

## Performance Optimization

### Current Optimizations
- React 19 with automatic batching
- Next.js App Router with streaming
- Lazy loading with Suspense
- Ref-based track management (avoids re-renders)
- Callback memoization in useAgora
- `100dvh` viewport for consistent mobile height

### Potential Improvements
- Video quality adaptation based on network
- Bandwidth optimization
- Connection quality indicators
- Reconnection logic
- Pre-call device testing

## Deployment

### Build Commands

```bash
npm run build    # Production build
npm start        # Start production server
```

### Environment Setup

1. Set all required environment variables in deployment platform:
   - `NEXT_PUBLIC_AGORA_APP_ID`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`
2. Optionally set `NEXT_PUBLIC_AGORA_TOKEN` for production
3. Ensure HTTPS is enabled (required for WebRTC and screen sharing)
4. Configure CORS if needed
5. Verify Pusher app settings allow your domain

### Recommended Platforms

- **Vercel**: Native Next.js support
- **Netlify**: Good Next.js integration
- **AWS Amplify**: Full-stack deployment
- **Railway**: Simple deployment

## Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials:
# - Agora App ID from https://console.agora.io
# - Pusher credentials from https://pusher.com

# Run development server
npm run dev

# Open http://localhost:3000
```

### Testing

1. Open app in two browser windows/tabs
2. Create room in first window
3. Copy Room ID
4. Join with same Room ID in second window
5. Test mic/camera controls
6. Test screen sharing feature
7. Test chat messaging (send messages between windows)
8. Test leave functionality
9. Open a third window to test multi-party grid layout

## Future Enhancements

### Planned Features
- ~~Screen sharing~~ ✅ Implemented
- ~~Text chat~~ ✅ Implemented
- ~~Multi-party video calls~~ ✅ Implemented
- Display actual remote user names (instead of "User {uid}")
- Message persistence (database storage)
- Chat history for new joiners
- File sharing in chat
- Emoji reactions
- Typing indicators
- Call recording
- Virtual backgrounds
- Noise cancellation
- Connection quality indicators
- Call history
- User profiles
- Room passwords

### Technical Improvements
- Token authentication
- Database integration
- User management system
- Analytics and monitoring
- Error tracking (Sentry)
- Performance monitoring
- Automated testing

## Dependencies Analysis

### Production Dependencies
- `agora-rtc-sdk-ng`: Core video/audio functionality
- `pusher`: Server-side Pusher SDK for message broadcasting
- `pusher-js`: Client-side Pusher SDK for real-time messaging
- `lucide-react`: Icon library
- `next`: Framework
- `react` & `react-dom`: UI library

### Development Dependencies
- `@tailwindcss/postcss`: CSS processing
- `@types/*`: TypeScript definitions
- `eslint`: Code linting
- `typescript`: Type checking

### Bundle Size Considerations
- Agora SDK is the largest dependency (~2MB)
- Consider code splitting for optimization
- Lazy load Agora SDK if possible

## Troubleshooting Guide

### Common Issues

**Camera/Mic Not Working**
- Check browser permissions
- Ensure HTTPS (required for getUserMedia)
- Try different browser
- Check device availability

**Connection Failed**
- Verify Agora App ID
- Check network connectivity
- Ensure firewall allows WebRTC
- Try different network

**Remote User Not Visible**
- Confirm both users in same room
- Check Room ID spelling
- Verify both users granted permissions
- Check browser console for errors

**Audio Echo**
- Use headphones
- Check audio output settings
- Ensure only one tab is active

**Chat Not Working**
- Verify all Pusher environment variables are set
- Check browser console for connection errors
- Ensure Pusher app is active (not paused)
- Verify API route is accessible
- Check network tab for failed requests

**Messages Not Appearing**
- Confirm both users are in the same room
- Check Pusher connection status (should show "connected")
- Verify sender name is different for each user
- Check browser console for errors

**Screen Share Not Working**
- Ensure HTTPS is enabled (required for screen sharing)
- Check browser permissions for screen capture
- Try selecting a different window/tab/screen
- Verify browser supports screen sharing API
- Note: iOS Safari does not support screen sharing (button will be hidden on iOS devices)

## License

MIT License

## Credits

- **Framework**: Next.js by Vercel
- **Video SDK**: Agora.io
- **Icons**: Lucide Icons
- **Styling**: Tailwind CSS

## API Routes

### POST /api/send-message

**Purpose**: Broadcast chat messages via Pusher

**Request Body**:
```json
{
  "channel": "room-id",
  "message": {
    "text": "Hello",
    "sender": "User Name",
    "timestamp": 1234567890
  }
}
```

**Response**:
```json
{
  "success": true
}
```

**Error Handling**:
- Returns 500 if Pusher trigger fails
- Logs errors to console
- Client retries on failure

---

**Last Updated**: April 25, 2026
**Version**: 0.3.0
**Status**: Development
