gcloud run deploy web-campaign\
    --image=asia-southeast1-docker.pkg.dev/updoot-web-dev/updoot/web-campaign:latest \
    --concurrency=80 \
    --platform=managed \
    --region=asia-southeast1 \
    --project=updoot-web-dev