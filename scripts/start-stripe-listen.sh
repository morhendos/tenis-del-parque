#!/bin/bash
export PATH=/opt/homebrew/bin:$PATH
cd /Users/tomaszmikolajewicz/Projects/tenis-del-parque
KEY=$(grep '^STRIPE_SECRET_KEY' .env.local | cut -d= -f2)
pkill -f "stripe listen" 2>/dev/null
sleep 1
nohup stripe listen --api-key "$KEY" --forward-to localhost:3000/api/stripe/webhook > /tmp/stripe-listen.log 2>&1 &
echo started
