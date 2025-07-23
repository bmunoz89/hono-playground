# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.18-alpine AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install-dev
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS install-prod
# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS dev
COPY --from=install-dev /temp/dev/node_modules node_modules
COPY . .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "dev" ]

FROM base AS prod
ENV NODE_ENV=production
COPY --from=install-prod /temp/prod/node_modules node_modules
COPY . .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/app.ts" ]