FROM node:20

WORKDIR /app

# Copy and install shared module dependencies first
COPY shared/ ./shared/
RUN cd shared && npm install

# Set up service directory
WORKDIR /app/auth-service

COPY auth-service/package*.json ./
RUN npm install

COPY auth-service/ .
RUN npm run build

EXPOSE 3002

CMD ["node", "dist/auth-service/src/main.js"]
