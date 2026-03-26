FROM node:20

WORKDIR /app

# Copy and install shared module dependencies first
COPY shared/ ./shared/
RUN cd shared && npm install

# Set up service directory
WORKDIR /app/api-gateway

COPY api-gateway/package*.json ./
RUN npm install

COPY api-gateway/ .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
