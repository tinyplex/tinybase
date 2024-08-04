ARG BUN_VERSION=1.1.3

FROM oven/bun:${BUN_VERSION}-alpine as base
LABEL fly_launch_runtime="Bun"
WORKDIR /app
ENV NODE_ENV="production"

FROM base as build
COPY --link bun.lockb package.json ./
RUN bun install --ci
COPY --link . .

FROM base
COPY --from=build /app /app
EXPOSE 8043
CMD [ "bun", "index.ts" ]
