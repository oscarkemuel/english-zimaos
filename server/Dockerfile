
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache python3 make g++

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache libstdc++ \
    && apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev \
    && apk del .build-deps

COPY --from=build /app/dist ./dist

EXPOSE 8888

ENV VIDEOS_DIR=/app/videos
ENV DATABASE_FILE=/app/data/english.sqlite

CMD ["npm", "start"]
