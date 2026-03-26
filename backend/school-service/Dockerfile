FROM node:20

WORKDIR /app

# Copy and install shared module dependencies first
COPY shared/ ./shared/
RUN cd shared && npm install

# Set up service directory
WORKDIR /app/school-service

COPY school-service/package*.json ./
RUN npm install

COPY school-service/ .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/school-service/src/main.js"]
