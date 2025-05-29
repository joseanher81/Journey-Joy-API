# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copia solo los archivos de dependencias para caché de npm
COPY package*.json ./

# Instala solo dependencias de producción
RUN npm ci --only=production

# Copia el resto del código
COPY . .

# Etapa 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copia desde builder solo lo necesario
COPY --from=builder /app ./

# Expone el puerto que usa la app
EXPOSE 4000

# Comando para arrancar la app
CMD ["node", "server.js"]
