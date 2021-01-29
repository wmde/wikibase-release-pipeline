FROM python:3

RUN pip install requests

COPY download_artifacts.py /download_artifacts.py

RUN mkdir /zips
RUN mkdir /extractedArtifacts
RUN chown -R ${HOST_UID}:${HOST_UID} /extractedArtifacts
CMD [ "python", "./download_artifacts.py" ]
