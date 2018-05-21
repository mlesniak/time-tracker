#!/bin/bash

scripts/backup.sh
ssh root@$IP ./redeploy.sh
