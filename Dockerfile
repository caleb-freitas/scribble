FROM node:20-alpine AS base

RUN npm i -g pnpm

# dependencies handles instalation of all dependencies using pnpm
FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# build copies all of the node_modules from the stage dependencies, and runs the build command
FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

# deploy copies the built folders from stage build and runs the application
FROM base AS deploy

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules

CMD ["node", "dist/main.js"]
