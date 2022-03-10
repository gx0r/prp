# prp
password reverse proxy with self-generating TLS

Useful to put a basic auth in front of a website, e.g. for the RethinkDB admin interface. Configure via `prp.config.json`.

## Usage

node prp

## Deprecation Notice

Due to browsers nowadays not allowing to easily ignore self-signed certs, you're probably better off using `caddy reverse-proxy` with [basic auth](https://caddyserver.com/docs/caddyfile/directives/basicauth)
