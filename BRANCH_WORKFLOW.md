# Branch Workflow Guide

## 🌿 Branch Strategy

### **📋 Branches:**
- **dickson** - Your development branch (safe testing)
- **master** - Production branch (live site)
- **develop** - Optional shared development branch

---

## 🔄 Development Workflow

### **📝 Step 1: Work on Your Branch**
```bash
# Switch to your branch
git checkout dickson

# Make changes to files
# Test locally at http://localhost:8000

# Commit changes
git add .
git commit -m "Your improvement message"
git push origin dickson
```

### **🧪 Step 2: Test on Server IP**
```bash
# After push, CI/CD automatically deploys to test server
# Access: http://62.171.159.62:8074
# Test all features thoroughly
```

### **🚀 Step 3: Deploy to Production (When Ready)**
```bash
# Merge to master for production deployment
git checkout master
git merge dickson
git push origin master

# CI/CD deploys to: https://sikafeyecare.com
```

---

## 🌐 Environment URLs

| Branch | URL | Purpose |
|--------|-----|---------|
| **dickson** | http://62.171.159.62:8074 | Testing/Staging |
| **master** | https://sikafeyecare.com | Production |
| **local** | http://localhost:8000 | Development |

---

## 🔧 CI/CD Workflows

### **dickson Branch** → Test Server
- Triggers on push to `dickson` branch
- Deploys to: http://62.171.159.62:8074
- Uses `.env.local` configuration
- Safe for testing

### **master Branch** → Production
- Triggers on push to `master` branch
- Deploys to: https://sikafeyecare.com
- Uses `.env.server` configuration
- Live production environment

---

## 🛡️ Safety Measures

### **✅ Safe Testing:**
- Work on `dickson` branch first
- Test thoroughly on server IP
- Only merge to master when ready

### **⚠️ Production Safety:**
- `master` branch has manual trigger option
- Double-check before merging to master
- Test all features on test server first

---

## 📋 Example Workflow

### **Daily Development:**
```bash
# 1. Work on your branch
git checkout dickson
# Make changes...
git add .
git commit -m "Add new Optometry report feature"
git push origin dickson

# 2. Test on test server
# Visit: http://62.171.159.62:8074
# Test all new features

# 3. Deploy to production (when ready)
git checkout master
git merge dickson
git push origin master

# 4. Verify production
# Visit: https://sikafeyecare.com
# Confirm everything works
```

---

## 🔄 Rollback Plan

### **If Something Goes Wrong:**
```bash
# Rollback test server
git checkout dickson
git reset --hard HEAD~1
git push origin dickson --force

# Rollback production (emergency only)
git checkout master
git reset --hard HEAD~1
git push origin master --force
```

---

## 🎯 Best Practices

### **✅ Do:**
- Test on `dickson` branch first
- Verify all features on test server
- Use descriptive commit messages
- Merge to master only when ready

### **❌ Don't:**
- Push directly to master without testing
- Merge untested code to production
- Force push to master unless emergency
- Ignore test server results
