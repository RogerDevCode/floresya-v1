FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN mkdir -p public/js
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]