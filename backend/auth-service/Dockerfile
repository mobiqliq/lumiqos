FROM node:20
WORKDIR /app
COPY shared/ ./shared/
RUN cd shared && npm install && npm install --save-dev @types/node && npm run build
WORKDIR /app/auth-service
COPY auth-service/package*.json ./
RUN npm install
COPY auth-service/ .
RUN node -e 'const fs=require("fs"); const tsconfig=JSON.parse(fs.readFileSync("tsconfig.json","utf8")); tsconfig.compilerOptions.paths={"@lumiqos/shared":["../shared/dist/index"],"@lumiqos/shared/index":["../shared/dist/index"],"@lumiqos/shared/src/*":["../shared/dist/*"],"@lumiqos/shared/*":["../shared/dist/*"]}; fs.writeFileSync("tsconfig.json",JSON.stringify(tsconfig,null,2));' 
RUN npm run build
EXPOSE 3002
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
