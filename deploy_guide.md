# Optimized Deployment Guide for cPanel Shared Hosting

## Overview
This guide provides step-by-step instructions for deploying the Avocado Classification API on cPanel shared hosting with optimized configurations for performance and reliability.

## Prerequisites
- cPanel account with Python 3.7+ support and Passenger/mod_wsgi
- SSH access or File Manager access
- MySQL database access
- At least 512MB RAM allocation (recommended)

## Quick Start Checklist
- [ ] Upload all project files
- [ ] Create virtual environment
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up database
- [ ] Configure .htaccess
- [ ] Set file permissions
- [ ] Test deployment

---

## Detailed Deployment Steps

### 1. Upload Project Files
Upload the entire project to your cPanel account:

**Recommended location:** `/home/yourusername/public_html/avocado-api/`

**Required files:**
- All Python files (`main.py`, `passenger_wsgi.py`, `config.py`)
- `api/` directory with all modules
- `templates/` and `static/` directories
- `requirements.txt`
- `.htaccess`
- `model.tflite` and `labels.txt`
- This deployment guide

### 2. Create Virtual Environment
```bash
# Navigate to your project directory
cd /home/yourusername/public_html/avocado-api

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### 3. Install Dependencies
```bash
# Install all required packages
pip install -r requirements.txt

# If TensorFlow installation fails, try TensorFlow Lite only:
pip uninstall tensorflow
pip install tensorflow-lite==2.14.0

# Verify installation
pip list
```

### 4. Configure Environment Variables
Create a `.env` file in your project root:

```bash
# Create .env file
touch .env
chmod 600 .env
```

Edit `.env` with your actual credentials:
```env
# Database Configuration
DATABASE_URL=mysql+pymysql://your_db_user:your_db_password@localhost/your_db_name

# Security Configuration
SECRET_KEY=your_super_secure_secret_key_here_change_this
JWT_EXPIRATION_DAYS=7

# Environment Settings
FLASK_ENV=production
FLASK_DEBUG=False

# Optional: Custom paths (if needed)
# UPLOAD_FOLDER=/home/yourusername/public_html/avocado-api/uploads
```

### 5. Set Up MySQL Database
1. **Create Database in cPanel:**
   - Go to cPanel → MySQL Databases
   - Create a new database (e.g., `yourusername_avocado`)
   - Create a database user with full privileges
   - Note the database name, username, and password

2. **Update .env file** with your database credentials

### 6. Configure .htaccess File
Update the `.htaccess` file with your actual paths:

```apache
# Enable Passenger for Python applications
PassengerEnabled on

# IMPORTANT: Replace with your actual cPanel paths
PassengerAppRoot /home/yourusername/public_html/avocado-api
PassengerPython /home/yourusername/public_html/avocado-api/.venv/bin/python

# Set startup file
PassengerStartupFile passenger_wsgi.py

# Environment variables for production
SetEnv FLASK_ENV production
SetEnv FLASK_DEBUG False

# Security headers (already configured)
# File protection rules (already configured)
# Static file caching (already configured)
```

### 7. Set File Permissions
```bash
# Set correct permissions
chmod 644 passenger_wsgi.py
chmod 644 .htaccess
chmod 600 .env
chmod 644 *.py
chmod -R 644 api/
chmod -R 644 templates/
chmod -R 644 static/
chmod 644 model.tflite labels.txt

# Create and set permissions for upload directory
mkdir -p uploads
chmod 755 uploads

# Make directories executable
find . -type d -exec chmod 755 {} \;
```

### 8. Configure Python App in cPanel (Alternative Method)
If your hosting provider supports Python App setup:

1. Go to **cPanel → Python App**
2. **Create Application:**
   - Python version: 3.7+ (latest available)
   - Application root: `/home/yourusername/public_html/avocado-api`
   - Application URL: Your desired subdomain/path
   - Application startup file: `passenger_wsgi.py`
   - Application Entry point: `application`

### 9. Test Your Deployment

#### Basic Connectivity Test
1. Visit your domain/subdomain
2. You should see: `{"message": "Welcome to the Avocado Classification API!"}`

#### API Documentation Test
- Visit: `https://yourdomain.com/api/docs`
- Should display Swagger UI documentation

#### Admin Panel Test
- Visit: `https://yourdomain.com/admin_panel`
- Should display the modern admin login interface

#### API Endpoints Test
```bash
# Test login (replace with your domain)
curl -X POST https://yourdomain.com/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}'
```

### 10. Security Configuration

#### Change Default Credentials
```python
# After first deployment, create secure admin user
# Access your app and change default passwords immediately
```

#### Environment Security
- Ensure `.env` file has 600 permissions
- Never commit `.env` to version control
- Use strong, unique SECRET_KEY

#### File Security
- Python files are protected by .htaccess rules
- Only `passenger_wsgi.py` is accessible
- Static files have proper caching headers

---

## Optimization Features

### Performance Optimizations
1. **TensorFlow Lite**: Uses lightweight ML model loading
2. **Static File Caching**: 1-month cache for CSS/JS/images
3. **Gzip Compression**: Automatic compression for text files
4. **Optimized Dependencies**: Pinned versions for stability

### Resource Management
1. **Memory Efficient**: Uses TensorFlow Lite instead of full TensorFlow
2. **Error Handling**: Robust error handling prevents crashes
3. **Logging**: Comprehensive logging for debugging

### Security Features
1. **File Protection**: Python source files are protected
2. **Security Headers**: XSS, clickjacking, and content-type protection
3. **Environment Variables**: Sensitive data in .env file
4. **Input Validation**: Secure file upload handling

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Module Not Found" Error
```bash
# Ensure virtual environment is activated
source .venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check Python path in .htaccess
```

#### 2. Database Connection Error
```bash
# Test database connection
mysql -u your_db_user -p -h localhost your_db_name

# Verify .env file credentials
cat .env
```

#### 3. TensorFlow Loading Error
```bash
# Switch to TensorFlow Lite
pip uninstall tensorflow
pip install tensorflow-lite==2.14.0

# Check model file permissions
ls -la model.tflite labels.txt
```

#### 4. Static Files Not Loading
```bash
# Check static file permissions
chmod -R 644 static/
find static/ -type d -exec chmod 755 {} \;

# Verify .htaccess static file rules
```

#### 5. Passenger/WSGI Errors
1. Check cPanel Error Logs
2. Verify `passenger_wsgi.py` syntax:
   ```bash
   python3 passenger_wsgi.py
   ```
3. Ensure correct paths in `.htaccess`

### Debugging Commands
```bash
# Check Python version
python3 --version

# Test app creation
python3 -c "from api import create_app; app = create_app(); print('App created successfully')"

# Check installed packages
pip list | grep -E "(Flask|tensorflow|pymysql)"

# View recent error logs (if SSH access available)
tail -f /home/yourusername/logs/error_log
```

---

## Performance Monitoring

### Key Metrics to Monitor
1. **Response Time**: API endpoint response times
2. **Memory Usage**: Python process memory consumption
3. **Database Connections**: MySQL connection pool usage
4. **Error Rates**: Application and server error frequencies

### Optimization Tips
1. **Database Indexing**: Add indexes to frequently queried columns
2. **Image Optimization**: Compress uploaded images before processing
3. **Caching**: Implement Redis/Memcached if available
4. **CDN**: Use CDN for static files if traffic is high

---

## Maintenance

### Regular Tasks
- [ ] **Weekly**: Check error logs and application performance
- [ ] **Monthly**: Update dependencies (test in staging first)
- [ ] **Quarterly**: Review and rotate SECRET_KEY
- [ ] **As needed**: Backup database and uploaded files

### Update Procedure
```bash
# Backup current installation
cp -r /home/yourusername/public_html/avocado-api /home/yourusername/backup/

# Update dependencies
source .venv/bin/activate
pip install --upgrade -r requirements.txt

# Test application
python3 -c "from api import create_app; create_app()"

# Restart application (touch passenger_wsgi.py)
touch passenger_wsgi.py
```

---

## Support and Resources

### Getting Help
1. **Check Error Logs**: cPanel → Error Logs
2. **Test Locally**: Use `python main.py` for local testing
3. **Contact Hosting Provider**: For Passenger-specific issues
4. **Community Support**: Flask and cPanel communities

### Useful Commands
```bash
# Restart application
touch passenger_wsgi.py

# Check disk usage
du -sh /home/yourusername/public_html/avocado-api

# Monitor real-time logs (if available)
tail -f /home/yourusername/logs/error_log
```

### Additional Resources
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Passenger Documentation](https://www.phusionpassenger.com/docs/)
- [cPanel Python App Guide](https://docs.cpanel.net/cpanel/software/python-selector/)

---

## Conclusion

This optimized deployment provides:
- ✅ Production-ready configuration
- ✅ Enhanced security measures
- ✅ Performance optimizations
- ✅ Comprehensive error handling
- ✅ Modern, responsive admin interface
- ✅ Detailed troubleshooting guide

Your Avocado Classification API is now ready for production use on cPanel shared hosting!
