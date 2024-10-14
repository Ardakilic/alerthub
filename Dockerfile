# Install npm packages
FROM node:20 as builder

WORKDIR /usr/src/app

COPY package.json .

RUN yarn install --prod

# Push js files
FROM node:20-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/ /usr/src/app/

COPY ./src ./src

COPY ./package.json ./package.json

COPY ./etc/config.js ./etc/config.js

EXPOSE 3444

CMD ["node", "src/index.js"]
