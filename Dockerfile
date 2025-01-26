# syntax=docker/dockerfile:1
FROM node:22.10-alpine
WORKDIR /app
RUN npm install express jsonwebtoken cookie-parser body-parser bcrypt dotenv --loglevel verbose

FROM node:22.10-alpine
COPY --from=0 /app /app
WORKDIR /app
ADD ./app ./
CMD ["node", "auth-server.mjs"]
