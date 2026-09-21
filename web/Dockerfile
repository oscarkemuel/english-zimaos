FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_SCRIPT_GOOGLE_APP
ARG VITE_YOUTUBE_API_KEY

ENV VITE_SCRIPT_GOOGLE_APP=${VITE_SCRIPT_GOOGLE_APP}
ENV VITE_YOUTUBE_API_KEY=${VITE_YOUTUBE_API_KEY}

RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]