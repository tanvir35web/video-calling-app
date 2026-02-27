# Video Calling App

A real-time video calling application built with Next.js and Agora RTC SDK. Users can create or join video rooms using a simple Room ID system.

## Features

- 🎥 Real-time video and audio communication
- 🎤 Mute/unmute microphone
- 📹 Toggle camera on/off
- 👥 One-to-one video calls
- 🌐 Room-based system (join with Room ID)
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Video SDK**: Agora RTC SDK NG
- **Icons**: Lucide React
- **Runtime**: React 19

## Prerequisites

- Node.js 20+ installed
- Agora account and App ID ([Get one here](https://www.agora.io/))

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd video-calling-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Enter your name
2. Enter a Room ID (e.g., "room123")
3. Click "Join করুন" to enter the room
4. Share the same Room ID with another person to connect
5. Use the controls to:
   - Toggle microphone (mute/unmute)
   - Toggle camera (on/off)
   - Leave the call

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page (join room)
│   ├── room/[roomId]/
│   │   └── page.tsx          # Video call room
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── VideoCall.tsx         # Main video call component
│   └── VideoPlayer.tsx       # Video player component
├── hooks/
│   └── useAgora.ts           # Agora SDK integration hook
└── .env.local                # Environment variables
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_AGORA_APP_ID` | Your Agora App ID | Yes |
| `NEXT_PUBLIC_AGORA_TOKEN` | Agora token (optional for testing) | No |

## Building for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy this app is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your `NEXT_PUBLIC_AGORA_APP_ID` in environment variables
4. Deploy

## Notes

- For production use, implement Agora token authentication
- Camera and microphone permissions are required
- Works best on modern browsers (Chrome, Firefox, Safari, Edge)

## License

MIT
