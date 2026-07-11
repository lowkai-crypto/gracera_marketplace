FROM python:3.11-slim AS base
RUN pip install uv

FROM base AS deps
WORKDIR /app
COPY apps/ai-service/pyproject.toml ./
RUN uv pip install --system --no-cache -r pyproject.toml

FROM base AS runner
WORKDIR /app
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY --from=deps /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=deps /usr/local/bin /usr/local/bin
# Installed here (not in `deps`) because `--with-deps` apt-installs system
# libraries scattered across many OS paths — those aren't cleanly copyable
# between stages the way Python site-packages are, so this stage needs to
# do its own apt install rather than inherit one.
RUN apt-get update \
    && playwright install --with-deps chromium \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY apps/ai-service/ .
RUN addgroup --system --gid 1001 aiservice && adduser --system --uid 1001 --gid 1001 aiservice \
    && chown -R aiservice:aiservice /ms-playwright
USER aiservice
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
