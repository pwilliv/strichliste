from strichliste import create_app, config
from strichliste.frontend.routes import init_with_dummy_data

app = create_app()

if __name__ == '__main__':
    if config.reset or config.testing:
        init_with_dummy_data()
    app.run(debug=config.debug, host=config.host, port=config.port)
