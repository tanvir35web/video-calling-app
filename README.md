# Video Call App - Project Documentation

## Overview

A real-time peer-to-peer video calling application built with Next.js 16 and Agora RTC SDK. The app enables users to create or join video rooms using a simple Room ID system, supporting one-to-one video and audio communication with Bengali language UI elements.

## Tech Stack

### Core Technologies
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Runtime**: React 19.2.3
- **Video SDK**: Agora RTC SDK NG 4.24.2

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
│   ├── layout.tsx                # Root layout with fonts
│   ├── globals.css               # Global styles
│   ├── favicon.ico               # App icon
│   └── room/[roomId]/
│       └── page.tsx              # Dynamic room page
├── components/
│   ├── VideoCall.tsx             # Main video call component
│   └── VideoPlayer.tsx           # Individual video player
├── hooks/
│   └── useAgora.ts               # Agora SDK integration hook
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
- **One-to-One Calls**: Supports two participants per room
- **Automatic Connection**: Detects when remote user joins/leaves

### 3. Media Controls
- **Microphone Toggle**: Mute/unmute audio
- **Camera Toggle**: Turn video on/off
- **Screen Sharing**: Share your screen, window, or tab with remote user
- **Leave Call**: Exit room and return to home
- **Visual Feedback**: Icons and UI states reflect control status

### 4. User Experience
- **Loading States**: Spinner during camera/mic initialization
- **Error Handling**: User-friendly error messages
- **Waiting State**: Shows placeholder when remote user hasn't joined
- **Live Indicator**: Visual "Live" badge during active calls
- **Responsive Design**: Works on desktop and mobile devices

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
- URL parameter extraction (roomId)
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
- Agora hook integration
- Local and remote video display
- Control buttons (mic, camera, screen share, leave)
- Screen sharing indicator badge
- Connection status display
- Error and loading states

**State Management**:
- Uses `useAgora` hook for all Agora functionality
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

### 5. useAgora Hook (`hooks/useAgora.ts`)

**Purpose**: Encapsulates all Agora SDK logic

**Responsibilities**:
- Client initialization
- Channel joining
- Track creation (audio/video/screen)
- Publishing local tracks
- Subscribing to remote users
- Event handling (user-published, user-left)
- Media control (mute, camera toggle, screen share)
- Track switching between camera and screen
- Cleanup on unmount

**Return Values**:
- `localVideoTrack`: Local video track
- `remoteUser`: Remote user object with tracks
- `isJoined`: Connection status
- `isMuted`: Microphone state
- `isCameraOff`: Camera state
- `isScreenSharing`: Screen sharing state
- `isLoading`: Initialization state
- `error`: Error message
- `toggleMic()`: Mute/unmute function
- `toggleCamera()`: Camera on/off function
- `toggleScreenShare()`: Start/stop screen sharing
- `leaveChannel()`: Disconnect function

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
9. Joins Agora channel with Room ID
10. Publishes local tracks
11. Listens for remote user events
12. Renders video players

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
4. Remote video/audio tracks added to state
5. VideoPlayer renders remote stream
6. UI updates to show "Connected" status

## Environment Configuration

### Required Variables

```bash
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id_here
```

### Optional Variables

```bash
NEXT_PUBLIC_AGORA_TOKEN=your_token_for_production
```

**Note**: Token authentication is recommended for production but optional for testing.

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
- **Remote Tracks**: Received via subscription
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

- **Mobile**: Single column video layout
- **Desktop**: Two-column grid for local/remote video
- **Controls**: Always centered at bottom

## Known Issues & Limitations

1. **One-to-One Only**: Currently supports only 2 participants
2. **No Token Auth**: Uses null token (testing mode)
3. **No Recording**: Call recording not implemented
4. **No Chat**: Text chat feature not available
5. **Browser Compatibility**: Requires modern browsers with WebRTC support
6. **Screen Share**: Camera is disabled while screen sharing is active
7. **iOS Limitation**: Screen sharing is not supported on iOS devices (Safari/Chrome on iPhone/iPad)

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

1. Set `NEXT_PUBLIC_AGORA_APP_ID` in deployment platform
2. Optionally set `NEXT_PUBLIC_AGORA_TOKEN` for production
3. Ensure HTTPS is enabled
4. Configure CORS if needed

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
# Edit .env.local with your Agora App ID

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
7. Test leave functionality

## Future Enhancements

### Planned Features
- Multi-party video calls (3+ participants)
- ~~Screen sharing~~ ✅ Implemented
- Text chat
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

---

**Last Updated**: February 28, 2026
**Version**: 0.1.0
**Status**: Development
