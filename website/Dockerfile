# Use an official Nginx image as a base
FROM nginx:alpine

# Change the default Nginx listen port to 8080
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Copy the static website files into the Nginx default web directory
COPY . /usr/share/nginx/html

# Expose port 8080 (updated)
EXPOSE 8080

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
