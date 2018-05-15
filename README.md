
## Redeploy

    ssh root@$IP ./redeploy.sh

## Create docker container

    docker build -t time-tracker:latest .    

## Run

    docker run -d -v $(pwd)/data:/app/data -p 8000:3000 time-tracker
