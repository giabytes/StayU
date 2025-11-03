from flask import Flask
from flask_cors import CORS
from app.routes.statistics_routes import statistics_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(statistics_bp, url_prefix="/statistics")
    return app
