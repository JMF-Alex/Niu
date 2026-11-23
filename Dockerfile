FROM node:24-alpine AS base
RUN npm install -g pnpm@12.21.0
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile
COPY . .

FROM base AS web-build
RUN pnpm turbo run build --filter=@niu/web

FROM nginx:1.29-alpine AS web
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /repo/apps/web/dist /usr/share/nginx/html

FROM base AS api
WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/index.js"]
