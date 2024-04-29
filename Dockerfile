FROM node:20-alpine3.19
LABEL maintainer="denys.yaroshenko.mail@gmail.com"
WORKDIR /app

RUN apk update && apk upgrade

RUN apk add --update --no-cache \
  bash \
  autoconf \
  gcc \
  g++ \
  make \
  automake \
  nasm \
  lcms2-dev \
  libtool \
  zlib \
  libc6-compat \
  libpng \
  libpng-dev \
  mesa-dev \
  libxi \
  build-base \
  && rm -rf /var/cache/apk/* \
  && npm install -g gulp-cli gulp

COPY gulpfile.js package.json yarn.* ./
#RUN npm install

#RUN yarn test
ENTRYPOINT ["tail"]
CMD ["-f","/dev/null"]
