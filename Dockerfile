# Install npm packages
FROM node:12-alpine as builder

WORKDIR /usr/src/app

COPY package.json .

RUN yarn install --prod

# Push js files
FROM node:12-alpine

WORKDIR /usr/src/app

LABEL maintainer="Kaan Karakaya <ykk@theykk.net>"

COPY --from=builder /usr/src/app/ /usr/src/app/

COPY ./src ./src

COPY ./package.json ./package.json

COPY ./etc ./etc

CMD node src/index.js
