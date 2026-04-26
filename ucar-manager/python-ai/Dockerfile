FROM python:3.12-slim

WORKDIR /app

COPY employability/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY employability/ ./employability/

EXPOSE 8000

CMD ["uvicorn", "employability.employability_service:app", "--host", "0.0.0.0", "--port", "8000"]
