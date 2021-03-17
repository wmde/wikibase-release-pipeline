FROM docker-registry.wikimedia.org/wikimedia-buster:latest

COPY ./tag_git.sh /tag_git.sh
ENTRYPOINT [ "/bin/bash", "/tag_git.sh" ]