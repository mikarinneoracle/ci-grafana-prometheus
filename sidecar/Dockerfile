FROM node:22.20-alpine

WORKDIR /
COPY ./ /

RUN npm cache clean --force && rm -rf node_modules package-lock.json && npm install

CMD [ "node", "index.js" ] 
