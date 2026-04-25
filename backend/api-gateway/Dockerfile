FROM node:20

WORKDIR /app

# Copy and install shared module dependencies first
COPY shared/ ./shared/
RUN cd shared && npm install && npm install --save-dev @types/node && npm run build

# Set up service directory
WORKDIR /app/api-gateway

COPY api-gateway/package*.json ./
RUN npm install

COPY api-gateway/ .
RUN node -e 'const fs=require("fs"); const tsconfig=JSON.parse(fs.readFileSync("tsconfig.json","utf8")); tsconfig.compilerOptions.paths={"@xceliqos/shared":["../shared/dist/index"],"@xceliqos/shared/index":["../shared/dist/index"],"@xceliqos/shared/src/*":["../shared/dist/*"],"@xceliqos/shared/*":["../shared/dist/*"]}; fs.writeFileSync("tsconfig.json",JSON.stringify(tsconfig,null,2));'
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
