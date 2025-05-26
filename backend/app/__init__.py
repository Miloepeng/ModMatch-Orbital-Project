from dotenv import load_dotenv
import os
from flask import Flask

def create_app():
    app = Flask(__name__)
    # ... any config, routes, etc.
    return app

load_dotenv()

db_url = os.environ.get("DB_URL")

