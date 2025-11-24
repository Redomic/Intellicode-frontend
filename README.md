# IntelliCode Frontend

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)

**IntelliCode (IntelliT)** is an adaptive learning platform that bridges Intelligent Tutoring Systems (ITS) with coordinated Large Language Model (LLM) agents. This application serves as the interactive coding environment, adapting to the learner's mastery state in real-time through a centralized learner model.

This implementation is the reference frontend for the architecture described in *IntelliCode - Multi-Agent LLM Intelligent Teaching System: A Principled Architecture with Centralized Learner Modeling*.

## Key Capabilities

*   **Adaptive Coding Interface**: A fully-featured IDE powered by Monaco Editor that captures granular behavioral signals during coding sessions.
*   **Graduated Hinting Mechanism**: Implements a five-level scaffolding protocol (Metacognitive to Targeted) to support learning without solution disclosure.
*   **Real-time Proficiency Feedback**: Visualizes mastery progress and provides specific optimization advice (Time, Space, Readability) post-submission.
*   **Session Management**: Orchestrates daily check-ins and session pacing under the governance of the backend Engagement Orchestrator.

## Technical Architecture

The frontend is built on a modern, component-based stack designed for performance and maintainability.

| Component | Technology | Description |
|-----------|------------|-------------|
| **Core Framework** | React 19 | Component-based UI library |
| **Build Tool** | Vite | Next-generation frontend tooling |
| **State Management** | Redux Toolkit | Centralized state with `redux-persist` for session durability |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Editor** | Monaco Editor | VS Code-based code editor integration |
| **Network** | Axios | Promise-based HTTP client with interceptors |

## Getting Started

### Prerequisites

Ensure the following are installed on your development machine:

*   **Node.js**: v18.0.0 or higher
*   **npm**: v9.0.0 or higher (or equivalent yarn/pnpm)

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the `frontend` root directory to configure the backend connection.

```ini
# API Configuration
VITE_API_URL=http://localhost:8000
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

Access the application at `http://localhost:5173`.
