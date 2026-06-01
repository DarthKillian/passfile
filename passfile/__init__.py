import os
from flask import Flask
from passfile.db import db
from passfile.http import index, code, drop
from passfile.models import dropModel

def register_bp(app):
    app.register_blueprint(index.bp)
    app.register_blueprint(code.bp)
    app.register_blueprint(drop.bp)
    app.register_blueprint(dropModel.bp)

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'passfile.sqlite'),
        UPLOAD_FOLDER='/home/darthkillian'
    )

    register_bp(app)

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)

    return app