# Stage 1: Build the React app
FROM node:22-alpine AS builder

ARG REACT_APP_API_BASE_URL=http://localhost:8080
ARG REACT_APP_AI_ENDPOINT_MODE=STREAM_STANDARD
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_GOOGLE_REDIRECT_URI

ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_AI_ENDPOINT_MODE=$REACT_APP_AI_ENDPOINT_MODE
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GOOGLE_REDIRECT_URI=$REACT_APP_GOOGLE_REDIRECT_URI

WORKDIR /app

COPY . .


# Install and build
RUN npm install
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the SPA routing-aware nginx config (static)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
