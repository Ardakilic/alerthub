# Install npm packages
FROM node:20 AS builder

WORKDIR /app

COPY package.json .

RUN yarn install --prod

# Create the final image
# FROM node:20-slim AS runner
FROM gcr.io/distroless/nodejs20-debian12:latest

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3444

CMD ["node", "src/index.js"]
