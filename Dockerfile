# Install npm packages
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json .

RUN yarn install --prod

# Push js files
FROM node:20-alpine

WORKDIR /usr/src/app

LABEL maintainer="DantesBr <dantesbr@outlook.com>"

COPY --from=builder /usr/src/app/ /usr/src/app/

COPY ./src ./src

COPY ./package.json ./package.json

COPY ./etc ./etc

CMD ["node", "src/index.mjs"]
