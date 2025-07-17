import sys
import os
import logging
from api import create_app

# Set up basic logging for production debugging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

try:
    # Create the Flask application using the factory function
    application = create_app()
    logger.info("Flask application created successfully")
    
    # Ensure the application is properly configured for production
    if application.config.get('ENV') == 'production':
        application.config['DEBUG'] = False
        logger.info("Application configured for production environment")
    
except Exception as e:
    logger.error(f"Error during application creation: {str(e)}")
    # Re-raise the exception so Passenger can handle it appropriately
    raise e

# Note: Do not invoke app.run() here; this file is invoked by Passenger/mod_wsgi
