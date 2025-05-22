ARG PYTHON_IMAGE_URL
FROM ${PYTHON_IMAGE_URL} as python

WORKDIR /app
COPY pyproject.toml .
COPY callback.py .

RUN pip install --no-cache-dir .

CMD ["python", "callback.py"]
