FROM node:9
EXPOSE 3000

WORKDIR /app
# While ugly this is the only way to prevent binary compatibility issues with sqlite and mac vs linux.
ADD . /app
RUN rm -rf node_modules
RUN npm install --save express
RUN npm install --save body-parser
RUN npm install --save better-sqlite3   


CMD node server.js