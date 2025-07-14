# Gemini Frontend Clone - Kuvaka Tech Assignment

A fully functional, responsive, and visually appealing Gemini-style conversational AI chat application built with React, TypeScript, Tailwind CSS, and modern web technologies.

## 🚀 Live Demo

The application is deployed and ready for testing. You can access it at the local development server or deploy it to Vercel/Netlify.

## ✨ Features

### 🔐 Authentication System

- **OTP-based Login/Signup**: Complete phone number authentication flow
- **Country Code Selection**: Fetches real country data from REST Countries API
- **Form Validation**: React Hook Form + Zod validation
- **Simulated OTP**: Uses setTimeout to simulate real OTP sending and verification

### 💬 Chat Interface

- **Real-time Messaging**: User and AI message exchange
- **AI Response Simulation**: Throttled AI responses with typing indicators
- **Image Upload Support**: Base64 image handling with preview
- **Message Timestamps**: Formatted time display for all messages
- **Copy to Clipboard**: Click to copy any message content

### 📱 User Experience

- **Dark Theme**: Modern dark UI matching Gemini's design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Infinite Scroll**: Load older messages with pagination (20 per page)
- **Loading Skeletons**: Smooth loading states for messages
- **Toast Notifications**: Feedback for all major actions
- **Search Functionality**: Debounced search to filter chatrooms
- **Auto-scroll**: Automatically scrolls to latest messages

### 🗂️ Chatroom Management

- **Create Chatrooms**: Start new conversations
- **Delete Chatrooms**: Remove conversations with confirmation
- **Auto-naming**: Chatrooms named after first message
- **Recent History**: Organized list with timestamps
- **Search & Filter**: Find conversations quickly

### 💾 Data Persistence

- **localStorage**: Maintains auth state and chat history
- **State Management**: Zustand for clean, efficient state handling
- **Type Safety**: Full TypeScript implementation throughout

## 🛠️ Tech Stack

- **Framework**: React 18 with React Router 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3 with custom dark theme
- **State Management**: Zustand with localStorage persistence
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Vitest (ready for implementation)

## 📁 Project Structure

```
client/
├── components/
│   ├── auth/
│   │   ├── AuthWrapper.tsx      # Authentication flow wrapper
│   │   ├── PhoneLogin.tsx       # Phone number input with country codes
│   │   └── OtpVerification.tsx  # OTP input and verification
│   ├── chat/
│   │   ├── ChatLayout.tsx       # Main chat layout container
│   │   ├── Sidebar.tsx          # Chat history and navigation
│   │   ├── ChatArea.tsx         # Main chat interface
│   │   └── MessageList.tsx      # Message display with infinite scroll
│   └── ui/                      # Reusable UI components (Radix-based)
├── store/
│   └── index.ts                 # Zustand store with TypeScript
├── lib/
│   └── utils.ts                 # Utility functions
├── pages/
│   ├── Index.tsx               # Home page (redirects to chat)
│   └── NotFound.tsx            # 404 page
└── App.tsx                     # Main app component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gemini-frontend-clone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run typecheck  # TypeScript validation
npm test          # Run tests
```

## 🎯 Key Implementation Details

### Authentication Flow

The auth system uses a two-step verification process:

1. **Phone Input**: Users select country and enter phone number
2. **OTP Verification**: 6-digit code verification (simulated)

```typescript
// Simulated OTP sending
setTimeout(() => {
  setOtpSent(true);
  toast({ title: "OTP Sent", description: "Check your phone" });
}, 1500);
```

### State Management

Zustand provides clean, type-safe state management:

```typescript
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // State and actions
    }),
    { name: "gemini-app-storage" },
  ),
);
```

### AI Response Throttling

Simulates realistic AI thinking time:

```typescript
setTimeout(
  () => {
    const aiMessage = generateAIResponse(userMessage);
    addMessage(chatroomId, aiMessage);
    setTyping(false);
  },
  1500 + Math.random() * 2000,
); // 1.5-3.5s delay
```

### Infinite Scroll Implementation

Efficient message loading with pagination:

```typescript
const loadOlderMessages = useCallback(async () => {
  const newMessages = await fetchOlderMessages(page);
  setOlderMessages((prev) => [...newMessages, ...prev]);
  setPage((prev) => prev + 1);
}, [page]);
```

### Form Validation

Robust validation using Zod schemas:

```typescript
const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\\d+$/, "Phone number must contain only digits"),
});
```

## 🎨 Design System

### Theme Configuration

Custom dark theme optimized for chat interfaces:

```css
:root {
  --background: 224 20% 9%;
  --foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  /* ... */
}
```

### Component Architecture

- **Compound Components**: Complex UI broken into manageable pieces
- **Custom Hooks**: Reusable logic abstraction
- **Type Safety**: Full TypeScript coverage
- **Accessibility**: Keyboard navigation and screen reader support

## 📱 Responsive Design

The application adapts seamlessly across devices:

- **Desktop**: Full sidebar with chat area
- **Tablet**: Collapsible sidebar with touch optimization
- **Mobile**: Overlay sidebar with mobile-first interactions

## 🧪 Testing Strategy

Testing setup ready for:

- **Unit Tests**: Component testing with Vitest
- **Integration Tests**: User flow testing
- **E2E Tests**: Full application testing

## 🚀 Deployment

### Vercel Deployment

```bash
npm run build
vercel --prod
```

### Netlify Deployment

```bash
npm run build
netlify deploy --prod --dir=dist
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` for customization:

```env
VITE_APP_NAME=Gemini Clone
VITE_API_BASE_URL=your-api-url
```

### Tailwind Customization

Modify `tailwind.config.ts` for theme adjustments.

## 📊 Performance Optimizations

- **Code Splitting**: Dynamic imports for route-based splitting
- **Lazy Loading**: Component-level lazy loading
- **Optimized Images**: Efficient image handling and compression
- **State Optimization**: Minimal re-renders with Zustand
- **Bundle Analysis**: Vite's built-in analysis tools

## 🔐 Security Considerations

- **Input Validation**: All user inputs validated
- **XSS Prevention**: Sanitized message content
- **Data Persistence**: Local storage with encryption consideration
- **Type Safety**: Runtime type checking with Zod

## 🎯 Future Enhancements

- [ ] Real backend integration
- [ ] Voice message support
- [ ] File sharing capabilities
- [ ] Message reactions and editing
- [ ] Group chat functionality
- [ ] Advanced search with filters
- [ ] Export chat history
- [ ] Dark/light theme toggle
- [ ] PWA capabilities
- [ ] Push notifications

## 🐛 Known Issues

- OTP verification accepts any 6-digit code (by design for demo)
- AI responses are simulated (no real AI integration)
- Image uploads stored in memory (no persistent storage)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Kuvaka Tech** for the assignment opportunity
- **Google Gemini** for design inspiration
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Zustand** for state management simplicity

---

**Assignment Completed By**: [Your Name]  
**Submission Date**: [Current Date]  
**Time Spent**: ~8 hours  
**Live Demo**: [Deployment URL]  
**Repository**: [GitHub URL]

For any questions or clarifications, please reach out via email or GitHub issues.
