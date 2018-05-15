#!/bin/bash

wget -O master.zip https://github.com/mlesniak/time-tracker/archive/master.zip
rm -rf time-tracker-master
unzip master.zip

cd time-tracker-master
docker build -t time-tracker:latest .    
cd ..

docker stop $(docker ps -q)

docker run -d -v $(pwd)/data:/app/data -p 8000:3000 time-tracker
docker run -d -v $(pwd)/data-mlesniak:/app/data -p 8001:3000 time-tracker

