from flask import Flask
from strichliste.config import Config
from strichliste.extensions import db, migrate, bcrypt, login_manager, mail


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)
    from strichliste.backend.routes import backend
    from strichliste.frontend.routes import main
    from strichliste.users.routes import users
    # from strichliste.errors.handlers import errors
    app.register_blueprint(backend)
    app.register_blueprint(main)
    app.register_blueprint(users)
    # app.register_blueprint(errors)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)

    return app
