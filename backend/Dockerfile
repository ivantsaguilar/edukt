FROM node:24.22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["sh", "-c", "npm run db:seed && npm start"]