set -eu

mc alias set actnow "$S3_ENDPOINT" "$S3_ACCESS_KEY_ID" "$S3_SECRET_ACCESS_KEY"

mc mb --ignore-existing "actnow/$S3_BUCKET_UPLOADS"
mc mb --ignore-existing "actnow/$S3_BUCKET_GENERATED"
mc mb --ignore-existing "actnow/$S3_BUCKET_EXPORTS"

mc anonymous set none "actnow/$S3_BUCKET_UPLOADS"
mc anonymous set none "actnow/$S3_BUCKET_GENERATED"
mc anonymous set none "actnow/$S3_BUCKET_EXPORTS"
