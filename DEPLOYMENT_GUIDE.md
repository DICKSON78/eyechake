# 🚀 Deployment Guide - Security & RBAC Feature

## 📋 Overview
This feature implements comprehensive security and role-based access control (RBAC) for the EyeChake system.

## 🔄 Deployment Steps

### 1. **Pre-Deployment Checklist**
- [ ] Backup current database
- [ ] Review security middleware configurations
- [ ] Verify CORS settings for production domains
- [ ] Test authentication flow

### 2. **Database Migrations**
```bash
# Run new migrations for session security
php artisan migrate
```

### 3. **Cache Clearing**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### 4. **Environment Variables**
Update `.env` file for production:
```env
# Session Security
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true

# CORS Settings (update with your production domain)
APP_URL=https://yourdomain.com
```

### 5. **Middleware Registration**
The following middleware are automatically registered:
- `CheckRole` - Role-based access control
- `CheckPrivilege` - Privilege-based access control  
- `SecurityHeaders` - HTTP security headers
- `SanitizeInput` - XSS protection

## 🔒 Security Features

### Role-Based Access Control
- **Admin**: Full system access
- **Director**: Management oversight access
- **Receptionist**: Patient registration only
- **Cashier**: Payment processing only
- **Doctor**: Consultation room only
- **Sales**: Sales table only
- **Pharmacist**: Pharmacy only
- **Optician**: Workshop only
- **HR**: Employee management only

### API Security
- All routes protected with authentication + privilege checks
- Rate limiting on login endpoints (5 attempts/minute)
- Input sanitization for XSS prevention
- CORS restrictions to specific origins

### Session Security
- Database driver for session storage
- Encrypted session data
- HTTP-only cookies
- SameSite cookie protection

## ⚠️ Breaking Changes

### API Routes
- All API endpoints now require specific privileges
- Example: `/api/patients` requires `reception` privilege
- Update any external API consumers accordingly

### Frontend
- Role-based dashboard routing implemented
- Menu visibility now based on user roles
- Update any direct route navigation

## 🧪 Testing Checklist

### Security Testing
```bash
# Test authentication
curl -X POST http://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test role-based access (should return 403 for unauthorized)
curl -X GET http://yourdomain.com/api/patients \
  -H "Authorization: Bearer TOKEN"
```

### User Access Testing
1. **Login as each role** and verify:
   - Only authorized menu items visible
   - Dashboard routes to correct department
   - API access restricted to authorized endpoints

2. **Cross-department access testing**:
   - Doctor cannot access cashier endpoints
   - Receptionist cannot access pharmacy data
   - Sales cannot access financial reports

## 🚨 Rollback Plan

If issues occur:
```bash
# Rollback to previous commit
git checkout master
git pull origin master

# Clear caches
php artisan cache:clear
php artisan config:clear

# Restore database if needed
php artisan migrate:rollback --step=1
```

## 📞 Support Contacts

- **Security Issues**: Contact senior development team
- **Deployment Issues**: Contact DevOps team
- **Access Issues**: Contact system administrator

## 🔐 Security Headers Added

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

## 📊 Performance Impact

- **Minimal**: Middleware adds ~2-5ms per request
- **Database**: Session storage increases DB load slightly
- **Memory**: Privilege caching reduces repeated queries

## ✅ Post-Deployment Verification

1. **Security Verification**
   - [ ] All roles can only access authorized sections
   - [ ] CORS headers properly configured
   - [ ] Security headers present in responses

2. **Functionality Verification**
   - [ ] Login works for all user types
   - [ ] Dashboards load correctly per role
   - [ ] Menu items show/hide based on role

3. **Performance Verification**
   - [ ] Page load times acceptable
   - [ ] API response times within limits
   - [ ] Database queries optimized

---

**⚠️ IMPORTANT**: This feature significantly enhances security but requires thorough testing before production deployment.
