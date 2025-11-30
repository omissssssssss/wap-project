# Gunakan node alpine untuk ringan
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies (pakai legacy-peer-deps agar lebih stabil)
RUN npm install --legacy-peer-deps

# Copy seluruh source code
COPY . .

# Expose port yang digunakan Vite
EXPOSE 3000

# Jalankan dev server
CMD ["npm", "run", "dev"]
