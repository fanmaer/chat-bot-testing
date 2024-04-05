FROM node:20.11.1

RUN  apt-get update && apt-get install

RUN apt-get install -y chromium-l10n

RUN apt-get install -y chromium-l10n

RUN apt-get -y install net-tools

RUN apt-get -y install iputils-ping

RUN useradd --user-group --system --create-home --no-log-init pptruser

USER pptruser

RUN mkdir -p /home/pptruser/node/app/node_modules && chown -R pptruser:pptruser /home/pptruser/node/app

RUN chmod -R 777 /home/pptruser/node/app

WORKDIR /home/pptruser/node/app


RUN chmod -R 777 /home/pptruser/node/app

USER pptruser


RUN chmod -R 777 /home/pptruser/node/app

COPY --chown=pptruser:pptruser . .


EXPOSE 3000

CMD [ "node", "server.js" ]