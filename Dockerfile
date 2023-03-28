FROM node:latest

# Copy local code to the container image.
WORKDIR $APP_HOME
COPY $APP_HOME/package.json .
RUN npm install

COPY . .

RUN npm run build


# Run the web service on container startup.
EXPOSE 3000
CMD ["npm", "start"]