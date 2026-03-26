FROM node:20

WORKDIR /app

# Copy and install shared module dependencies first
COPY shared/ ./shared/
RUN cd shared && npm install

# Set up service directory
WORKDIR /app/billing-service

COPY billing-service/package*.json ./
RUN npm install

COPY billing-service/ .
RUN npm run build

EXPOSE 3006

CMD ["node", "dist/billing-service/src/main.js"]
