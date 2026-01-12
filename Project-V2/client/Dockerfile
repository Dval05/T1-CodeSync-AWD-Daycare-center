# Etapa 1: Build
FROM node:20-alpine as build
WORKDIR /app

# Definir argumentos para recibir variables de Render al construir
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_BUSINESS_URL
ARG VITE_API_CRUD_URL
ARG VITE_GOOGLE_CLIENT_ID

# Pasarlos al entorno de Node durante el build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_BUSINESS_URL=$VITE_API_BUSINESS_URL
ENV VITE_API_CRUD_URL=$VITE_API_CRUD_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: Serve con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Configuración para SPA (evitar 404 al recargar)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]