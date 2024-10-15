FROM python:3.11-slim as builder

RUN mkdir -p /app

ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    POETRY_VERSION=1.8.3

# Install os build dependencies if any
RUN  --mount=type=cache,target=/var/cache/apt \
    runtimeDeps='' \
    && set -x  \
    && apt-get update \
    && apt-get install -y git openssh-client build-essential \
    && pip install --upgrade pip

# installing via pip
RUN pip install "poetry==$POETRY_VERSION"

# To use the secret during build on your local: docker build -f Dockerfile . --secret id=PRIVATE_REPO_ACCESS_TOKEN,src=/tmp/my_token_on_host_machine
RUN --mount=type=secret,id=PRIVATE_REPO_ACCESS_TOKEN export PRIVATE_REPO_ACCESS_TOKEN=$(cat /run/secrets/PRIVATE_REPO_ACCESS_TOKEN) && if [ ! -z "$PRIVATE_REPO_ACCESS_TOKEN" ]; then git config --global url."https://${PRIVATE_REPO_ACCESS_TOKEN}@github.com/".insteadOf "git@github.com:"; fi

WORKDIR /app

# Install Python dependencies
COPY ./pyproject.toml ./poetry.lock ./

# Configure git with GitHub Token using a secret
RUN --mount=type=secret,id=github_token \
    git config --global url."https://$(cat /run/secrets/github_token)@github.com/".insteadOf "ssh://git@github.com/"

# the cache directory makes rebuilding a docker image if pyproject.toml changes near instant
RUN --mount=type=cache,target=$POETRY_CACHE_DIR poetry install --no-root --without dev,test --no-interaction --no-ansi

# removing poetry alone saves 200 mb
FROM python:3.11-slim as runtime

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

# Copy the rest of the code
COPY . .

ENTRYPOINT ["./.venv/bin/opentelemetry-instrument", "--traces_exporter", "otlp", "--metrics_exporter", "otlp", "--logs_exporter", "otlp", "--service_name", "postgresql-application", "python", "main.py"]
