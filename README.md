
## Create docker container

    docker build -t time-tracker:latest .    

## Run

    docker run -it --rm -v $(pwd)/data:/app/data -p 8000:3000 time-tracker
