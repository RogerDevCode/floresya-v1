FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN mkdir -p public/js
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]