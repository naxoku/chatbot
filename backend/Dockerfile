# Imagen base ligera
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install --production

# Copiar el resto del código
COPY . .

# Variables de entorno opcionales (solo como ejemplo)
ENV NODE_ENV=production
ENV PORT=4000

# Exponer el puerto del backend
EXPOSE 4000

# Comando para iniciar el servidor
CMD ["node", "app.js"]
