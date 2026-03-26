# Domain Configuration - sikafeyecare.com

## 🌐 Production Domain

**Primary Domain**: https://sikafeyecare.com

**Server IP**: 62.171.159.62:8074 (for testing/admin access)

---

## 📋 Environment Configuration

### **Production Server (.env.server)**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://sikafeyecare.com
```

### **Local Development (.env.local)**
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

---

## 🔧 Server Configuration

### **Nginx Configuration**
```nginx
server_name sikafeyecare.com www.sikafeyecare.com;
root /var/www/public;
index index.php;

location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass app:9000;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### **SSL Certificate**
```bash
# Install SSL certificate for HTTPS
certbot --nginx -d sikafeyecare.com -d www.sikafeyecare.com
```

---

## 🚀 Deployment Workflow

### **Local Development**
```bash
cp .env.local .env
php artisan serve
npm run dev
# Access: http://localhost:8000
```

### **Production Deployment**
```bash
git push origin master
# CI/CD automatically deploys to:
# https://sikafeyecare.com
```

---

## 📊 Access Points

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Local** | http://localhost:8000 | Development |
| **Production** | https://sikafeyecare.com | Live site |
| **Server IP** | http://62.171.159.62:8074 | Testing/Admin |

---

## 🔍 Verification

### **Check Domain Configuration**
```bash
# On server
curl -I https://sikafeyecare.com

# Check SSL
openssl s_client -connect sikafeyecare.com:443
```

### **Check Application**
```bash
# Test application
curl https://sikafeyecare.com

# Check API endpoints
curl https://sikafeyecare.com/api/test
```

---

## ⚠️ Important Notes

- **Production**: Uses HTTPS with SSL certificate
- **Local**: Uses HTTP for development
- **Server IP**: Direct access for testing
- **CI/CD**: Automatically deploys to production domain

---

## 🎯 SEO Considerations

- **Canonical URL**: https://sikafeyecare.com
- **WWW Redirect**: www.sikafeyecare.com → sikafeyecare.com
- **HTTPS Only**: HTTP → HTTPS redirect
- **SSL Certificate**: Valid and auto-renewing
