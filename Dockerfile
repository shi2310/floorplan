FROM nginx:alpine

ENV WORKSPACE=/usr/src/app
WORKDIR ${WORKSPACE}
COPY . .

# nginx config
COPY nginx.conf /etc/nginx/nginx.conf

RUN apk add --no-cache nodejs npm \
  && npm i && npm run build \
  && mv dist/* /usr/share/nginx/html \
  && rm -rf ${WORKSPACE} \
  && apk del -f nodejs npm

EXPOSE 80
