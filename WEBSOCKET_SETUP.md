# WebSocket Server Setup for Laravel 9

This project uses **Soketi** as the WebSocket server (a free, open-source Pusher replacement). Soketi is faster and easier than laravel-websockets for Laravel 9.

## Option 1: Soketi (Recommended - Fastest)

### Installation

```bash
# Install Soketi globally via npm
npm install -g @soketi/soketi

# Or run with npx (no installation needed)
npx @soketi/soketi start
```

### Configuration

Create `soketi.json` in project root:

```json
{
  "debug": true,
  "host": "0.0.0.0",
  "port": 6001,
  "appManager.array.apps": [
    {
      "id": "eyechake-app",
      "key": "eyechake-key-local",
      "secret": "eyechake-secret-local",
      "maxConnections": 1000,
      "enableClientMessages": false,
      "enabled": true,
      "maxBackendEventsPerSecond": 100,
      "maxClientEventsPerSecond": 100,
      "maxReadRequestsPerSecond": 100
    }
  ]
}
```

### Start Server

```bash
# Start with config file
npx @soketi/soketi start --config=soketi.json

# Or start with inline config
npx @soketi/soketi start --debug
```

Server will run on `http://127.0.0.1:6001`

---

## Option 2: Laravel WebSockets (Alternative)

### Installation

```bash
composer require beyondcode/laravel-websockets

php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"

php artisan migrate

php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
```

### Configuration

Update `config/websockets.php`:

```php
'apps' => [
    [
        'id' => env('PUSHER_APP_ID'),
        'name' => env('APP_NAME'),
        'key' => env('PUSHER_APP_KEY'),
        'secret' => env('PUSHER_APP_SECRET'),
        'path' => env('PUSHER_APP_PATH'),
        'capacity' => null,
        'enable_client_messages' => false,
        'enable_statistics' => true,
    ],
],
```

### Start Server

```bash
php artisan websockets:serve
```

Server will run on `http://127.0.0.1:6001`

Dashboard available at: `http://localhost:8000/laravel-websockets`

---

## Environment Setup

Make sure your `.env` file has:

```env
BROADCAST_DRIVER=pusher
QUEUE_CONNECTION=database

PUSHER_APP_ID=eyechake-app
PUSHER_APP_KEY=eyechake-key-local
PUSHER_APP_SECRET=eyechake-secret-local
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

---

## Testing

1. **Start the WebSocket server** (Soketi or Laravel WebSockets)
2. **Start Laravel queue worker**:
   ```bash
   php artisan queue:work
   ```
3. **Start Laravel dev server**:
   ```bash
   php artisan serve
   ```
4. **Start Vite dev server**:
   ```bash
   npm run dev
   ```
5. **Open browser console** - you should see:
   ```
   ✅ WebSocket connected successfully
   ```

6. **Trigger a notification** (e.g., create appointment, send message)
7. **Check console** - you should see event received without page reload

---

## Production Deployment

### Using Soketi

```bash
# Install as systemd service
sudo npm install -g @soketi/soketi

# Create systemd service file: /etc/systemd/system/soketi.service
[Unit]
Description=Soketi WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/eyechake
ExecStart=/usr/bin/soketi start --config=/var/www/eyechake/soketi.json
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable soketi
sudo systemctl start soketi
```

### Nginx Reverse Proxy

Add to nginx config:

```nginx
location /ws {
    proxy_pass http://127.0.0.1:6001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Update production `.env`:

```env
PUSHER_HOST=sikafeyecare.com
PUSHER_PORT=443
PUSHER_SCHEME=https
```

---

## Troubleshooting

### Connection refused
- Make sure WebSocket server is running (`netstat -ano | findstr :6001` on Windows)
- Check firewall allows port 6001
- Verify `PUSHER_*` credentials match in `.env` and `soketi.json`

### Events not received
- Check Laravel queue worker is running (`php artisan queue:work`)
- Verify `BROADCAST_DRIVER=pusher` and `QUEUE_CONNECTION=database`
- Clear config cache: `php artisan config:clear`
- Check browser console for WebSocket connection status

### Auth errors
- Make sure `/broadcasting/auth` route exists in Laravel
- Verify token is in localStorage: `localStorage.getItem('token')`
- Check Authorization header includes Bearer token

---

## Performance Benefits

**Before (Polling):**
- 1,800 HTTP requests per hour per user
- 50 active users = 90,000 requests/hour
- High server load, delayed updates (2-30s)

**After (WebSocket):**
- 1 persistent connection per user
- 50 active users = 50 connections
- Instant updates (<100ms), minimal server load

**Cost Savings:**
- ~99.9% reduction in HTTP requests
- ~95% reduction in bandwidth usage
- Real-time experience for users
