# Avocado Classification API - Optimized for cPanel Shared Hosting

A modern Flask-based API for avocado classification using TensorFlow Lite, optimized for deployment on cPanel shared hosting environments.

## 🚀 Features

- **Modern Admin Panel**: Clean, responsive UI with Inter font and modern design
- **Image Classification**: TensorFlow Lite model for avocado type classification
- **User Management**: JWT-based authentication with admin and user roles
- **RESTful API**: Complete CRUD operations for avocado details
- **cPanel Ready**: Optimized for shared hosting deployment
- **Responsive Design**: Mobile-friendly interface
- **Swagger Documentation**: Auto-generated API documentation

## 📁 Project Structure

```
├── api/                    # Flask application package
│   ├── __init__.py        # App factory and configuration
│   ├── models.py          # Database models
│   ├── routes.py          # API endpoints
│   └── utils.py           # Utility functions and decorators
├── static/                # Static assets
│   ├── css/style.css      # Modern CSS styles
│   ├── js/admin_script.js # Admin panel JavaScript
│   └── swagger.json       # API documentation
├── templates/             # HTML templates
│   └── admin_panel.html   # Modern admin interface
├── main.py               # Development entry point
├── passenger_wsgi.py     # Production WSGI entry point
├── config.py             # Application configuration
├── requirements.txt      # Python dependencies
├── .htaccess            # Apache configuration
├── .env.example         # Environment variables template
└── deploy_guide.md      # Deployment instructions
```

## 🛠️ Installation & Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avocado-classification-api
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the application**
   ```bash
   python main.py
   ```

### cPanel Deployment

Follow the comprehensive guide in `deploy_guide.md` for step-by-step deployment instructions.

## 🎨 Modern UI Features

### Design System
- **Typography**: Inter font family for modern, clean text
- **Color Palette**: Professional blue and gray color scheme
- **Layout**: Responsive grid system with flexbox
- **Components**: Modern cards, buttons, and form elements
- **Animations**: Smooth transitions and hover effects

### Admin Panel
- **Dashboard**: Overview with quick action cards
- **Navigation**: Clean tab-based navigation system
- **Forms**: Modern input fields with proper validation
- **Tables**: Responsive data tables with action buttons
- **Messages**: Toast-style success/error notifications

## 🔧 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration

### Avocado Management (Admin Only)
- `GET /admin/avocado-details` - List all avocado details
- `POST /admin/avocado-details` - Create new avocado detail
- `GET /admin/avocado-details/{id}` - Get specific avocado detail
- `PUT /admin/avocado-details/{id}` - Update avocado detail
- `DELETE /admin/avocado-details/{id}` - Delete avocado detail

### Classification
- `POST /classify` - Classify uploaded image
- `GET /admin/classifications` - View classification history (Admin)

### Public
- `GET /avocado-details/{fruit_type}` - Get avocado details by type
- `GET /api/docs` - Swagger documentation

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- **Admin Role**: Full access to all endpoints
- **User Role**: Limited access to classification endpoints
- **Token Expiration**: 7 days (configurable)

### Default Credentials (Development Only)
- **Admin**: username: `admin`, password: `adminpass`
- **User**: username: `user1`, password: `userpass`

**⚠️ Important**: Change these credentials in production!

## 🗄️ Database Models

### User
- `id`: Primary key
- `username`: Unique username
- `password_hash`: Hashed password
- `role`: User role (admin/user)
- `created_at`: Creation timestamp

### AvocadoFruitDetail
- `id`: Primary key
- `fruit_type`: Avocado type name
- `description`: Detailed description
- `image_url`: Optional image URL
- `timestamp`: Creation timestamp

### Classification
- `id`: Primary key
- `image_path`: Path to uploaded image
- `classification_result`: Model prediction
- `processed`: Processing status
- `timestamp`: Classification timestamp

## 🚀 Production Optimizations

### Performance
- **Minified CSS**: Optimized stylesheets
- **Efficient Queries**: Optimized database operations
- **Caching**: Static file caching via Apache
- **Compression**: Gzip compression for text files

### Security
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt password hashing
- **Input Validation**: Server-side validation
- **CORS Configuration**: Proper cross-origin settings

### Hosting Compatibility
- **Passenger WSGI**: Compatible with cPanel
- **Environment Variables**: Secure configuration
- **Error Handling**: Comprehensive error management
- **Logging**: Production-ready logging

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL=mysql+pymysql://user:password@host/db_name
SECRET_KEY=your_super_secret_key
FLASK_ENV=production
```

### Database Configuration
- **Development**: SQLite (default)
- **Production**: MySQL/MariaDB (recommended for cPanel)

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- **Desktop**: Full-featured interface
- **Tablet**: Optimized layout with collapsible navigation
- **Mobile**: Touch-friendly interface with stacked layout

## 🧪 Testing

### Manual Testing
1. Start the development server
2. Navigate to `http://localhost:5000/admin_panel`
3. Test login functionality
4. Test CRUD operations for avocado details
5. Test image classification endpoint

### API Testing
Use the Swagger documentation at `/api/docs` for interactive API testing.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For deployment issues or questions:
1. Check the `deploy_guide.md` for detailed instructions
2. Review cPanel error logs
3. Verify environment variables and file permissions
4. Contact your hosting provider for Passenger-specific issues

---

**Built with ❤️ for modern web deployment**
