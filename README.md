# IntelliCode Frontend

**Multi-Agent LLM Intelligent Teaching System**

The frontend interface for IntelliCode (IntelliT), a novel adaptive learning platform that bridges Intelligent Tutoring Systems (ITS) with coordinated LLM agents. This application provides a rich, interactive coding environment that adapts to the learner's mastery state in real-time.

Based on the architecture described in: *IntelliCode - Multi-Agent LLM Intelligent Teaching System: A Principled Architecture with Centralized Learner Modeling*.

## Key Features

As described in the system architecture:
- **Adaptive Coding Interface**: A fully-featured IDE (Monaco Editor) that tracks behavioral signals.
- **Graduated Hinting Mechanism**: Supports the "Pedagogical Feedback" agent by displaying hints in five levels (Metacognitive, Conceptual, Strategic, Structural, Targeted) without revealing solutions.
- **Real-time Proficiency Feedback**: Visualizes mastery progress and provides optimization tips (Time, Space, Readability) after submission.
- **Session Management**: Handles daily check-ins and session pacing governed by the Engagement Orchestrator.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + Redux Persist
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **API Client**: Axios (configured with interceptors)
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the `frontend` root to configure the connection to the backend orchestrator:

```env
VITE_API_URL=http://localhost:8000  # Default local backend URL
```

### Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).
