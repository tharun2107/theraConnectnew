# Therabee Frontend

A modern React frontend for the Therabee therapy booking platform, built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Role-based Authentication**: Separate dashboards for Parents, Therapists, and Admins
- **Child Management**: Parents can add and manage their children's information
- **Session Booking**: Easy-to-use booking system with real-time slot availability
- **Therapist Management**: Therapists can create time slots and request leaves
- **Admin Panel**: Admins can approve therapists and manage the platform
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Live notifications and data updates

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **React Hook Form** for form management
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Therabee backend running on port 3000

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your backend URL:
   ```
   VITE_API_URL=http://localhost:3000/api/v1
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3001`

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── Header.tsx     # Top navigation header
│   │   ├── Sidebar.tsx    # Side navigation
│   │   ├── LoadingSpinner.tsx
│   │   ├── AddChildModal.tsx
│   │   ├── BookSessionModal.tsx
│   │   ├── CreateTimeSlotsModal.tsx
│   │   └── RequestLeaveModal.tsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/               # Utility libraries
│   │   └── api.ts         # API client configuration
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── TherapistDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## User Roles

### Parent
- View dashboard with children and upcoming sessions
- Add and manage children's information
- Book therapy sessions with available therapists
- View booking history and status

### Therapist
- View profile and session statistics
- Create time slots for specific dates
- Request leaves (automatically cancels affected bookings)
- View upcoming sessions and patient information

### Admin
- Approve or suspend therapist accounts
- View all therapists and their status
- Monitor platform activity
- Manage system settings

## API Integration

The frontend integrates with the Therabee backend API:

- **Authentication**: `/api/v1/auth/*`
- **Parent Management**: `/api/v1/parents/*`
- **Therapist Management**: `/api/v1/therapists/*`
- **Admin Functions**: `/api/v1/admin/*`
- **Booking System**: `/api/v1/bookings/*`
- **Time Slots**: `/api/v1/slots/*`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for consistent styling

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory

3. Deploy the `dist/` directory to your hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Therabee platform.
