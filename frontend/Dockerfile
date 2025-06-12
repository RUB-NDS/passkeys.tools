FROM node:23.10

# app dir
RUN mkdir -p /app
WORKDIR /app

# install dependencies
COPY package.json /app
COPY package-lock.json /app
RUN npm install

# install app
COPY . /app
RUN npm run build

# run app
CMD ["npm", "run", "preview"]
