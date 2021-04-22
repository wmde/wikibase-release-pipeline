FROM ubuntu:xenial as fetcher

ARG tarball
COPY $tarball .
RUN mkdir wikidata-query-gui \
    && tar xfv $tarball -C ./wikidata-query-gui \
    && rm $tarball

# TODO this should probably just be a node image?
FROM nginx:stable-alpine as builder

COPY --from=fetcher /wikidata-query-gui /tmp/wikidata-query-gui

WORKDIR /tmp/wikidata-query-gui

# install dependencies
RUN apk --no-cache add --virtual build-dependencies ca-certificates git~=2.30 nodejs~=14 npm~=14 jq~=1.6 make~=4.3 g++~=10.2

# TODO do npm build instead of leaving any dev node modules hanging around
RUN mv package.json package.json.orig \
    && jq 'delpaths([["devDependencies","karma-qunit"],["devDependencies","qunitjs"],["devDependencies","sinon"]])' \
        > package.json < package.json.orig \
    && jq 'setpath(["devDependencies","less"]; "~2.7.1")' \
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
