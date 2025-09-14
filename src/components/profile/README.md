# Profile Components

This directory contains components for user profile settings and account management. Progress and activity tracking are now handled by the main dashboard.

## Components

### ProfileInfo.jsx
- **Purpose**: User profile information display and editing
- **Features**:
  - Profile avatar with user initials
  - Editable personal information (name, email, bio, location, etc.)
  - Social links (GitHub, LinkedIn, website)
  - Account statistics display
  - Real-time form validation
  - Save/cancel functionality

### AccountSettings.jsx
- **Purpose**: General account preferences and settings
- **Features**:
  - Notification preferences (email, reminders, progress updates)
  - Language and timezone settings
  - Code editor preferences (font size, tab size, minimap, etc.)
  - Privacy settings (profile visibility, activity sharing)
  - Theme selection
  - Default programming language

### SecuritySettings.jsx
- **Purpose**: Security and authentication management
- **Features**:
  - Password change functionality
  - Two-factor authentication setup
  - Active session management
  - Backup code generation and management
  - Security best practices guidance
  - Session revocation

## Usage

The profile components are used within the `ProfilePage` component which provides:
- Sidebar navigation between sections
- Consistent layout and styling
- User context passing to all components
- Responsive design for mobile and desktop

## Navigation Structure

```
Profile Settings
├── Profile (ProfileInfo)
├── Settings (AccountSettings)
└── Security (SecuritySettings)
```

## Note

Progress tracking and activity history are now handled by the main GitHub-style dashboard at `/dashboard`. This profile page focuses specifically on account management and settings.

## Data Flow

All components receive the `user` object as props containing:
- Basic user information
- Profile data
- Preferences
- Security settings
- Progress statistics

Components use Redux for global state management and local state for form handling and temporary UI states.

## Form Validation

Profile components use the shared `FormInput` component and validation utilities from `utils/validation.js` for consistent form behavior and error handling.

## Responsive Design

All components are built with mobile-first responsive design using Tailwind CSS classes for optimal viewing on all devices.
