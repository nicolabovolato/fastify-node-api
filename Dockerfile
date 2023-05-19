FROM node:18-alpine as base
WORKDIR /app
RUN npm i -g pnpm@8.5

FROM base as build

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY .swcrc ./
COPY ./src ./src
RUN pnpm build

FROM base as prod

COPY package.json pnpm-lock.yaml ./
COPY --from=build /app/dist ./dist
RUN pnpm install --frozen-lockfile --prod

USER node
EXPOSE 80
ENTRYPOINT [ "pnpm", "start" ]
