# start with bare minimum image
FROM alpine:3.19.1

# Update basic packages
RUN apk update && apk add nano openssh-server git bash wget curl ca-certificates tar libc6-compat g++ make python3 py3-pip supervisor nodejs
# SSH keys and some login related stuff (some work only for prod)
RUN mkdir -p /run/sshd /root/.ssh \
  && chmod 0700 /root/.ssh \
  && ssh-keygen -A \
  && sed -i s/^#PasswordAuthentication\ yes/PasswordAuthentication\ no/ /etc/ssh/sshd_config \
  && sed -i s/root:!/"root:*"/g /etc/shadow \
  # Welcome message
  && echo "Welcome to MyAPP (Diploi)!" > /etc/motd \
  # Go to app folder by default
  && echo "cd /app;" >> /root/.bashrc
  
# Gitconfig secrets and credential helper
RUN ln -s /etc/diploi-git/gitconfig /etc/gitconfig
COPY diploi-credential-helper /usr/local/bin

# Init and run supervisor
COPY diploi-runonce.sh /usr/local/bin/diploi-runonce.sh
COPY supervisord.conf /etc/supervisord.conf

CMD /usr/bin/supervisord -c /etc/supervisord.conf -n