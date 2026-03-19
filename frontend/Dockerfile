# Etapa 1 — Build con Node
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2 — Servir con Nginx
FROM nginx:alpine

# Copiar archivos de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar template de nginx (con variables de entorno)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Variable de entorno con valor por defecto (se sobreescribe desde docker-compose.yml)
ENV BACKEND_PORT=${BACKEND_PORT:-4000}

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]