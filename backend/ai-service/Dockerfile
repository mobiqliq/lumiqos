FROM node:20

WORKDIR /app

# Copy shared module preserving directory structure
COPY shared/ ./shared/

# Set up service directory
WORKDIR /app/ai-service

COPY ai-service/package*.json ./

RUN npm install

COPY ai-service/ .

RUN npm run build

EXPOSE 3005

CMD ["npm", "run", "start"]
