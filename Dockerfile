# Stage 0
# Install all dependencies and build app.
FROM node:lts-alpine AS builder
RUN apk add curl
WORKDIR /home/solonglatlong
COPY . .
ENV NODE_ENV=production
# Disable Next.js telemetry - see https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn install
RUN yarn add --dev typescript @types/react @types/node
RUN yarn run build
#RUN curl -ssS -L https://www.dropbox.com/s/mgo8alw3f2c0v74/tambaram.geojson?dl=1 -o data/indiapostal.geojson
RUN curl -ssS -L https://www.dropbox.com/s/wtme02vd41ucfpx/indiapostal.geojson?dl=1 -o data/indiapostal.geojson

# Stage 1
# Copy built app from stage 0, install only runtime dependencies, and run app.
# Also run the app as non-root user as a best practice.
FROM node:lts-alpine
RUN addgroup -S latlongers && adduser -S latlonger -G latlongers
USER latlonger
RUN mkdir /home/latlonger/solonglatlong
WORKDIR /home/latlonger/solonglatlong

COPY --chown=latlonger:latlongers ./package.json ./yarn.lock ./
RUN yarn install --production && \
    yarn cache clean --force
COPY --from=builder --chown=latlonger:latlongers /home/solonglatlong/ .

# Remove sources.
RUN rm -rf components/ pages/ utils/

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD yarn run start
