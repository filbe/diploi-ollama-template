FROM ghcr.io/filbe/diploi-ollama-template:main

# Install application code
WORKDIR /app
COPY . .

RUN npm install

COPY runonce.sh /usr/local/bin/runonce.sh

RUN curl https://ollama.ai/install.sh | sh
# This is the project level supervisor config that includes only in-project configs
# All Diploi-level dependent configs are in template level, so you could just rely on it
# Feel free to add your own supervisor processes in this file!
COPY supervisord-app.conf /etc/supervisord-app.conf
# we still need to reload supervisor to make it work
CMD /usr/bin/supervisord -c /etc/supervisord.conf; tail -f /dev/null
