FROM node:20.9-alpine AS build

WORKDIR /app

COPY package.json ./ 
COPY package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM nginx:alpine-slim

COPY --from=build /app/build /usr/share/nginx/html

COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf
