#!/bin/bash
export PATH=/opt/homebrew/bin:$PATH
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
cd /Users/tomaszmikolajewicz/Projects/tenis-del-parque
pkill -f "next dev" 2>/dev/null
sleep 1
nohup npm run dev > /tmp/tdp-dev.log 2>&1 &
echo started
