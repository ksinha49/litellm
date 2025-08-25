# Base image for building
ARG LITELLM_BUILD_IMAGE=registry.access.redhat.com/ubi9/python-311

# Runtime image
ARG LITELLM_RUNTIME_IMAGE=registry.access.redhat.com/ubi9/python-311

# Optional proxy configuration
ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG NO_PROXY="localhost,127.0.0.1"
# Builder stage
FROM $LITELLM_BUILD_IMAGE AS builder

# Set the working directory to /app
WORKDIR /app

USER root

# Accept proxy settings at build time
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY=${HTTP_PROXY} \
    HTTPS_PROXY=${HTTPS_PROXY} \
    NO_PROXY=${NO_PROXY}

# Install build dependencies
RUN dnf -y update && \
    dnf install -y gcc python3-devel openssl openssl-devel && \
    dnf clean all


RUN pip install --upgrade pip && \
    pip install build

# Copy the current directory contents into the container at /app
COPY . .

# Build Admin UI
RUN chmod +x docker/build_admin_ui.sh && ./docker/build_admin_ui.sh

# Build the package
RUN rm -rf dist/* && python -m build

# There should be only one wheel file now, assume the build only creates one
RUN ls -1 dist/*.whl | head -1

# Install the package
RUN pip install dist/*.whl

# install dependencies as wheels
RUN pip wheel --no-cache-dir --wheel-dir=/wheels/ -r requirements.txt

# ensure pyjwt is used, not jwt
RUN pip uninstall jwt -y
RUN pip uninstall PyJWT -y
RUN pip install PyJWT==2.9.0 --no-cache-dir

# Runtime stage
FROM $LITELLM_RUNTIME_IMAGE AS runtime

# Ensure runtime stage runs as root
USER root

# Accept proxy settings at build time
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY=${HTTP_PROXY} \
    HTTPS_PROXY=${HTTPS_PROXY} \
    NO_PROXY=${NO_PROXY}

# Install runtime dependencies
RUN dnf -y update && \
    dnf install -y openssl tzdata && \
    dnf clean all

WORKDIR /app
# Copy the current directory contents into the container at /app
COPY . .
RUN ls -la /app

# Copy the built wheel from the builder stage to the runtime stage; assumes only one wheel file is present
COPY --from=builder /app/dist/*.whl .
COPY --from=builder /app/litellm/proxy/_experimental/out /app/litellm/proxy/_experimental/out
COPY --from=builder /wheels/ /wheels/

# Install the built wheel using pip; again using a wildcard if it's the only file
RUN pip install *.whl /wheels/* --no-index --find-links=/wheels/ && rm -f *.whl && rm -rf /wheels

# Install semantic_router and aurelio-sdk using script
RUN chmod +x docker/install_auto_router.sh && ./docker/install_auto_router.sh

# Generate prisma client
RUN prisma generate
RUN chmod +x docker/entrypoint.sh
RUN chmod +x docker/prod_entrypoint.sh

EXPOSE 4000/tcp

RUN pip install supervisor --no-cache-dir
COPY docker/supervisord.conf /etc/supervisord.conf

ENTRYPOINT ["docker/prod_entrypoint.sh"]

# Append "--detailed_debug" to the end of CMD to view detailed debug logs
CMD ["--port", "4000"]
