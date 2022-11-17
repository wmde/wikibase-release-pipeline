FROM ubuntu:xenial as fetcher

ARG tarball
COPY $tarball .
RUN mkdir wikidata-query-gui \
    && tar xfv $tarball -C ./wikidata-query-gui \
    && rm $tarball

FROM node:14-alpine as builder

COPY --from=fetcher /wikidata-query-gui /tmp/wikidata-query-gui

WORKDIR /tmp/wikidata-query-gui

# install dependencies
RUN apk --no-cache add --virtual build-dependencies ca-certificates git jq make g++

# TODO do npm build instead of leaving any dev node modules hanging around
RUN mv package.json package.json.orig \
    && jq 'delpaths([["devDependencies","karma-qunit"],["devDependencies","sinon"]])' \
        > package.json < package.json.orig \
    && npm install \
    && npm run build


FROM nginx:stable-alpine as final

WORKDIR /usr/share/nginx/html

COPY --from=builder /tmp/wikidata-query-gui/build /usr/share/nginx/html
RUN echo "" > style.css
COPY entrypoint.sh /entrypoint.sh
COPY custom-config.json /templates/custom-config.json
COPY default.conf /templates/default.conf

ENV LANGUAGE=en\
    BRAND_TITLE=DockerWikibaseQueryService\
    COPYRIGHT_URL=undefined

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"