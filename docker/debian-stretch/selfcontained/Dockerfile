FROM node:12-stretch AS BUILDER
# LABEL maintainer="Patrik J. Braun"
# copying only package{-lock}.json to make node_modules cachable
RUN git clone -b feature/custom https://github.com/tuur29/pigallery2.git /build
WORKDIR /build
RUN set -x && npm install --unsafe-perm && \
    mkdir -p /build/release/data/config && \
    mkdir -p /build/release/data/db && \
    mkdir -p /build/release/data/images && \
    mkdir -p /build/release/data/tmp && \
    npm run create-release && \
    cd /build/release && npm install --unsafe-perm


FROM node:12-stretch-slim
WORKDIR /app
ENV NODE_ENV=production \
    CONFIG_FILE=/app/data/config/config.json \
    Server-Database-dbFolder=/app/data/db \
    Server-Media-folder=/app/data/images \
    Server-Media-tempFolder=/app/data/tmp
ENTRYPOINT ["npm", "start",  "--", \
  # after a extensive job (like video converting), pigallery calls gc, to clean up everthing as fast as possible
  "--expose-gc", \
  "--config-path=$CONFIG_FILE"]
EXPOSE 80
COPY --from=BUILDER /build/release /app
VOLUME ["/app/data/config", "/app/data/db", "/app/data/images", "/app/data/tmp"]
HEALTHCHECK --interval=30s --timeout=10s --retries=4 --start-period=60s \
  CMD wget --quiet --tries=1 --no-check-certificate --spider \
  http://localhost:80 || exit 1

