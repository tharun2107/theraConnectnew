# Database Setup Guide

## Issue
The backend is showing a database connection error:
```
Can't reach database server at `ep-steep-heart-adapgik1-pooler.c-2.us-east-1.aws.neon.tech:5432`
```

## Solutions

### Option 1: Use Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL locally:**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create a database:**
   ```sql
   CREATE DATABASE theraconnect;
   ```

3. **Create a `.env` file in the backend directory:**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/theraconnect?schema=public"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Zoom API Credentials (Get these from your Zoom account)
   ZOOM_ACCOUNT_ID="your-zoom-account-id"
   ZOOM_API_KEY="your-zoom-api-key"
   ZOOM_API_SECRET="your-zoom-api-secret"
   ZOOM_SDK_KEY="your-zoom-sdk-key"
   ZOOM_SDK_SECRET="your-zoom-sdk-secret"

   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Run Prisma migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

### Option 2: Use Neon Database (Cloud)

1. **Sign up for Neon:**
   - Go to: https://neon.tech/
   - Create a free account

2. **Create a new project:**
   - Follow the setup wizard
   - Copy the connection string

3. **Update your `.env` file:**
   ```env
   DATABASE_URL="your-neon-connection-string-here"
   ```

### Option 3: Use Supabase (Alternative Cloud)

1. **Sign up for Supabase:**
   - Go to: https://supabase.com/
   - Create a new project

2. **Get connection string:**
   - Go to Settings > Database
   - Copy the connection string

3. **Update your `.env` file:**
   ```env
   DATABASE_URL="your-supabase-connection-string-here"
   ```

## After Setting Up Database

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the backend:**
   ```bash
   npm run dev
   ```

## Testing the Connection

You can test if your database connection is working by running:
```bash
npx prisma db push
```

This will sync your schema with the database and create all the necessary tables.

## Environment Variables Reference

Make sure all these environment variables are set in your `.env` file:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `ZOOM_ACCOUNT_ID`: Your Zoom account ID
- `ZOOM_API_KEY`: Your Zoom API key
- `ZOOM_API_SECRET`: Your Zoom API secret
- `ZOOM_SDK_KEY`: Your Zoom SDK key
- `ZOOM_SDK_SECRET`: Your Zoom SDK secret
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

- **Connection refused**: Make sure PostgreSQL is running
- **Authentication failed**: Check username/password in DATABASE_URL
- **Database doesn't exist**: Create the database first
- **Permission denied**: Make sure the user has proper permissions

For more help, check the Prisma documentation: https://www.prisma.io/docs/
