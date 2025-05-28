# Use an official Nginx image as a base
FROM nginx:alpine

# Copy the static website files into the Nginx default web directory
COPY . /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]