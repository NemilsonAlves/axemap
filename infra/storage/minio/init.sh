#!/bin/sh
set -e

# Wait for MinIO to be ready
sleep 5

# Configure alias
mc alias set local http://localhost:9000 axemap axemap_minio_dev

# Create buckets
mc mb local/terreiros-fotos --ignore-existing
mc mb local/terreiros-documentos --ignore-existing
mc mb local/avatares --ignore-existing
mc mb local/backups --ignore-existing

# Set public policy for photos bucket
mc anonymous set download local/terreiros-fotos

# Set tags
mc tag set local/terreiros-fotos "purpose=fotos"
mc tag set local/terreiros-documentos "purpose=documentos"
mc tag set local/avatares "purpose=avatares"
mc tag set local/backups "purpose=backups"

echo "MinIO buckets created: terreiros-fotos, terreiros-documentos, avatares, backups"
