FROM ubuntu:22.10

RUN apt update
RUN apt-get install --yes curl nodejs npm build-essential
RUN npm i -g yarn 
COPY . /src
WORKDIR /src

RUN yarn
ENTRYPOINT yarn jest
