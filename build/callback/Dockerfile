FROM python:3.13-slim

WORKDIR /app
COPY pyproject.toml .
COPY callback.py .

RUN pip install --no-cache-dir .

CMD ["python", "callback.py"]
