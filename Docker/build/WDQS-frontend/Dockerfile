ARG COMPOSER_IMAGE
ARG NGINX_IMAGE
ARG NODE_IMAGE

# ###########################################################################
# hadolint ignore=DL3006
FROM ${COMPOSER_IMAGE} as composer
ARG WDQSQUERYGUI_COMMIT

RUN git clone https://gerrit.wikimedia.org/r/wikidata/query/gui /tmp/wikidata-query-gui && \
    git -C /tmp/wikidata-query-gui checkout ${WDQSQUERYGUI_COMMIT} && \
    git -C /tmp/wikidata-query-gui submodule update --init --recursive && \
    rm -f /tmp/wikidata-query-gui/.travis.yml && \
    find /tmp/wikidata-query-gui -name ".git*" -exec rm -rf {} +


# ###########################################################################
# hadolint ignore=DL3006
FROM ${NODE_IMAGE} as builder

COPY --from=composer /tmp/wikidata-query-gui /tmp/wikidata-query-gui

WORKDIR /tmp/wikidata-query-gui

# don't install chromium, it is not used
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# install dependencies
RUN apk --no-cache add --virtual build-dependencies ca-certificates git jq make g++

# TODO do npm build instead of leaving any dev node modules hanging around
RUN mv package.json package.json.orig \
    && jq 'delpaths([["devDependencies","karma-qunit"],["devDependencies","sinon"]])' \
        > package.json < package.json.orig \
    && npm install \
    && npm run build


# ###########################################################################
# hadolint ignore=DL3006
FROM ${NGINX_IMAGE} as final
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"

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

