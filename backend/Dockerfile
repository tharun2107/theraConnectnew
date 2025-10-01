# 1. Use Node base image
FROM node:20

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy rest of the code
COPY . .

# 6. Generate Prisma client
RUN npx prisma generate

# 7. Build TypeScript to dist/
RUN npm run build

# 8. Expose port (Render will override with $PORT)
EXPOSE 3000

# 9. Start app
CMD ["npm", "start"]
