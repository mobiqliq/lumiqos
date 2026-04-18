FROM node:20

WORKDIR /app

# 1. Build Shared Library (fixes the async_hooks/types issue)
COPY shared/ ./shared/
RUN cd shared &&     npm install &&     npm install --save-dev @types/node &&     npm run build

# 2. Build School Service
WORKDIR /app/school-service
COPY school-service/package*.json ./
RUN npm install

COPY school-service/ .

# 3. Robust Path Mapping (The "src" Fix)
# This explicitly tells Node: if you see "shared/src/...", look in "shared/dist/..."
RUN node -e '     const fs = require("fs");     const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));     tsconfig.compilerOptions.paths = {       "@lumiqos/shared": ["../shared/dist/index"],       "@lumiqos/shared/index": ["../shared/dist/index"],       "@lumiqos/shared/src/*": ["../shared/dist/*"],       "@lumiqos/shared/*": ["../shared/dist/*"]     };     fs.writeFileSync("tsconfig.json", JSON.stringify(tsconfig, null, 2)); '

RUN npm run build

EXPOSE 3001

# 4. Run with verified path and alias resolution
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
