# Install npm packages
FROM node:22 AS builder

WORKDIR /app

COPY package.json .

RUN yarn install --prod

# Create the final image
# FROM node:22-slim AS runner
FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3444

CMD ["node", "src/index.js"]
