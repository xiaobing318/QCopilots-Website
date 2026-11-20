# Pinned multi-platform manifest from the Docker Official Image registry.
FROM caddy:2.11.9-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0

ARG BASE_PATH=/
ARG RELEASE_ID=local
LABEL org.opencontainers.image.title="QCopilots Website"
LABEL org.opencontainers.image.source="https://github.com/xiaobing318/QCopilots-Website"
LABEL org.opencontainers.image.revision="${RELEASE_ID}"

# dist is built and checked outside Docker. No Node runtime or source code ships.
COPY dist/ /srv${BASE_PATH}/
COPY deploy/Caddyfile /etc/caddy/Caddyfile
ENV SITE_BASE_PATH=${BASE_PATH}
ENV SITE_ADDRESS=:80
ENV ACME_EMAIL_CONFIG=""
EXPOSE 80 443 443/udp
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=6 \
  CMD curl --fail --silent --max-time 3 http://127.0.0.1:2016/healthz || exit 1
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
