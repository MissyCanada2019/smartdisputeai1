# Use official Python image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Optional system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    pandoc \
 && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Install Python packages
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8000
ENV MAX_REQUEST_SIZE=100MB

# Expose port
EXPOSE 8000

# Start Flask with Gunicorn and extended upload limits
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000", "--limit-request-line", "8190", "--limit-request-field_size", "32768", "--limit-request-fields", "100", "--timeout", "300", "--worker-class", "gthread", "--threads", "4", "--worker-connections", "1000"]
