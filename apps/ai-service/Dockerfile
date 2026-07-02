FROM python:3.11-slim AS base
RUN pip install uv

FROM base AS deps
WORKDIR /app
COPY apps/ai-service/pyproject.toml ./
RUN uv pip install --system --no-cache -r pyproject.toml

FROM base AS runner
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=deps /usr/local/bin /usr/local/bin
COPY apps/ai-service/ .
RUN addgroup --system --gid 1001 aiservice && adduser --system --uid 1001 --gid 1001 aiservice
USER aiservice
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
