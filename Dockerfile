# Stage 1: Build the Vite application
FROM node:18-alpine AS build
 
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install
 
# Copy source code and build the app using Vite
COPY . .
RUN npm run build
 
# Stage 2: Serve the Vite app using Nginx
FROM nginx:alpine
 
# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf
 
# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# Copy the Vite build files to the Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html
 
# Expose port 80 for Nginx
EXPOSE 80
 
# Start Nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]