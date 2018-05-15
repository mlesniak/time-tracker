#!/bin/bash

ssh root@$IP zip -r - data\* >backup/backup-$(date +%Y-%m-%d-%H-%M).zip