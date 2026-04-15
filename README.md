# Wealth Intel Proxy — Deploy Guide

This is a lightweight Node.js proxy that scrapes Nitter (open-source X frontend)
to get real-time finance tweets without needing the X API.

-----

## Deploy to Railway (Recommended — Free)

1. Go to https://railway.app and sign up (free)
1. Click “New Project” → “Deploy from GitHub repo”
1. Upload or push this folder to a GitHub repo
1. Railway auto-detects Node.js and runs `npm start`
1. Click “Generate Domain” to get your public URL
1. Copy your URL (e.g. https://wealth-intel-proxy.up.railway.app)

-----

## Deploy to Render (Also Free)

1. Go to https://render.com and sign up
1. New → Web Service → Connect your GitHub repo
1. Build command: `npm install`
1. Start command: `node server.js`
1. Copy your public URL once deployed

-----

## Connect to the Artifact

Once deployed, open the Wealth Intel artifact and:

1. Click the ⚙ Settings button (top right)
1. Paste your backend URL into the “X Proxy URL” field
1. Hit Save — the app will now pull live X data

-----

## API Endpoints

GET /health                  — Check if server is running
GET /api/x-feed              — All finance accounts, scored & sorted
GET /api/x-feed/:account     — Single account (e.g. /api/x-feed/unusual_whales)

-----

## Nitter Instances

The server rotates through multiple Nitter instances automatically.
If all fail, the artifact falls back to RSS feeds gracefully.
You can add more instances to the NITTER_INSTANCES array in server.js.

Find active instances at: https://status.d420.de/
