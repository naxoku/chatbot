# Etapa 1 — Build con Node
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias de compilación para paquetes nativos
RUN apk add --no-cache build-base autoconf automake libtool zlib-dev libpng-dev nasm

# Variables de entorno para Vite (disponibles en build time)
ARG VITE_ENVIRONMENT=docker
ARG VITE_BACKEND_PORT=3000
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_BACKEND_PORT=$VITE_BACKEND_PORT

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2 — Servir con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]