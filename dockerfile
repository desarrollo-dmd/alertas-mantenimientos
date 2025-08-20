# Usa una imagen oficial de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de tu aplicación
COPY . .

# Expone el puerto en el que corre tu app (ajústalo si usas otro)
EXPOSE 3000

# Comando por defecto para iniciar la app
CMD [ "npm", "start" ]
