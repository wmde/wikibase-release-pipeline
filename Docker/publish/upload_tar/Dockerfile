FROM alpine:latest

RUN apk add --update openssh

COPY publish.sh publish.sh
RUN mkdir /uploads
ENTRYPOINT sh /publish.sh