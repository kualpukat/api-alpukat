from api import create_app
from api.models import User, db # Import User and db for initial setup

app = create_app()

if __name__ == '__main__':
    # This is for local development only. For cPanel, mod_wsgi will run the app.
    # Set up a default admin user for initial testing if needed
    with app.app_context():
        if not User.query.filter_by(username='admin').first():
            print("Creating default admin user...")
            admin_user = User(username='admin', role='admin')
            admin_user.set_password('adminpass') # Change this in production!
            db.session.add(admin_user)
            db.session.commit()
            print("Default admin user created: username='admin', password='adminpass'")
            
        if not User.query.filter_by(username='user1').first():
            print("Creating default user...")
            normal_user = User(username='user1', role='user')
            normal_user.set_password('userpass') # Change this in production!
            db.session.add(normal_user)
            db.session.commit()
            print("Default user created: username='user1', password='userpass'")

    app.run(debug=True, port=5000)
