ARG PORT=3001

FROM 002665144501.dkr.ecr.eu-central-1.amazonaws.com/base:node-16 AS builder

WORKDIR /build
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY ./package*.json /build/

RUN mkdir -p  ./scripts &&  mkdir -p .git/hooks && touch ./scripts/pre-commit.bash

# Install app dependencies
RUN npm install

# Creating App Image
FROM 002665144501.dkr.ecr.eu-central-1.amazonaws.com/base:node-16
# Creating application path and setting up permissions
RUN apk update  \
    && apk upgrade \
    && apk upgrade busybox --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main \
    && mkdir -p /usr/src/app \
    && chown -R node:node /usr/src/app

WORKDIR /usr/src/app
# Fetch dependencies from builder image
COPY --chown=node:node --from=builder /build/node_modules  /usr/src/app/node_modules
# Bundle app source
COPY  --chown=node:node . .

EXPOSE ${PORT}

RUN chown -R node:node /usr/src/app 
USER node
## Launch the wait tool and then your application
CMD npm start