FROM python:3

RUN pip install requests

COPY download_artifacts.py /download_artifacts.py

RUN mkdir /zips && \
    mkdir /extractedArtifacts

CMD [ "python", "./download_artifacts.py" ]
