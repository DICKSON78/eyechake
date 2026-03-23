# EyeChake CI/CD Setup

## 🚀 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/DICKSON78/eyechake.git
cd eyechake
```

### 2. Install Dependencies
```bash
composer install
npm install --legacy-peer-deps
```

### 3. Setup Environment
```bash
cp .env.local .env
php artisan key:generate
```

### 4. Start Development
```bash
php artisan serve
npm run dev
```

## 🔄 Workflow

### Development Branch
```bash
git checkout develop
# Make changes
git add .
git commit -m "Your changes"
git push origin develop
```

### Production Deployment
```bash
git checkout master
git merge develop
git push origin master
# CI/CD handles deployment automatically
```

## 🔧 Server Setup

### Database Remote Access
```bash
# On server
docker exec eyechake_db mysql -u root -pIsaac@2025 -e "
CREATE USER IF NOT EXISTS 'isaac'@'%' IDENTIFIED BY 'Isaac@2025';
GRANT ALL PRIVILEGES ON sikaf.* TO 'isaac'@'%';
FLUSH PRIVILEGES;
"
ufw allow 3306/tcp
```

## 📊 Access URLs

- **Local**: http://localhost:8000
- **Production**: https://sikafeyecare.com
- **Server IP**: http://62.171.159.62:8074 (for testing)
- **GitHub Actions**: https://github.com/DICKSON78/eyechake/actions

## 👤 Login Credentials

- **Admin**: tech / password123
- **Sales Manager**: sales_manager / password123
- **Optometry Specialist**: optometry_specialist / password123

## 🎯 Features

- ✅ Optometry Department (Section 3)
- ✅ Sales Management Department (Section 4)
- ✅ CRM Reports with real data
- ✅ Department Performance KPIs
- ✅ Role-based access control
- ✅ Automatic deployment on master push
