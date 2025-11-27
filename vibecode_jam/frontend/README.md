# VibeCode JAM - Frontend

Modern, beautiful web interface for technical interview platform with AI interviewer.

## 🚀 Features

- **Interactive Code Editor** - Monaco Editor with syntax highlighting for Python, JavaScript, Java, C++
- **Real-time AI Chat** - WebSocket-based real-time communication with AI interviewer
- **Test Runner** - Instant test execution with detailed results
- **Performance Metrics** - Real-time tracking of progress, score, and time
- **Anti-Cheat** - Detects paste events, DevTools usage, and tab switching
- **Beautiful Reports** - Comprehensive final report with AI feedback
- **Smooth Animations** - Framer Motion animations for professional feel

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - Powerful code editor
- **Socket.IO** - Real-time communication
- **Zustand** - Lightweight state management
- **Framer Motion** - Animation library

## 📦 Installation

```bash
npm install
```

## 🏃 Development

Start the development server:

```bash
npm run dev
```

Server will be available at `http://localhost:5174`

## 🔨 Build

Create a production build:

```bash
npm run build
```

Output will be in the `dist/` folder.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── InterviewSelector.tsx
│   ├── CodeEditor.tsx
│   ├── AIChat.tsx
│   ├── TestPanel.tsx
│   ├── MetricsDashboard.tsx
│   └── FinalReport.tsx
├── hooks/              # Custom React hooks
│   ├── useWebSocket.ts
│   └── useAntiCheat.ts
├── store/              # Zustand state management
│   └── interviewStore.ts
├── services/           # API and external services
│   └── api.ts
├── App.tsx             # Main application component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🎨 Design System

**Colors:**
- Primary: `#2E75B6` (Blue)
- Secondary: `#8B5CF6` (Purple)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Error: `#EF4444` (Red)
- Background: `#0F172A` (Dark Blue)
- Surface: `#1E293B` (Dark Gray-Blue)

**Typography:**
- Headers: Inter (bold)
- Body: Inter (regular)
- Code: JetBrains Mono

## 🌐 API Integration

The frontend expects a backend API running on `http://localhost:8000` with the following endpoints:

```
POST   /api/interview/start        - Start new interview
POST   /api/code/run               - Run code and tests
POST   /api/code/submit            - Submit solution
GET    /api/metrics/{sessionId}    - Get metrics
GET    /api/report/{sessionId}     - Get final report
POST   /api/anticheat/event        - Log anti-cheat events
```

WebSocket connection: `ws://localhost:8000`

## 🔒 Anti-Cheat Features

The application automatically detects and reports:
- Copy/Paste events
- DevTools opening
- Tab switching (page visibility changes)

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Made with ❤️ for VIBECODE JAM Hackathon
