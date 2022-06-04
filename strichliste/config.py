import os

# argument parsing
# parser = argparse.ArgumentParser(description="Starts the selfhosting 'strichliste' server")
# parser.add_argument(
#     "-d", "--debug",
#     action="store_true",
#     help="enables Flasks debugger (don't ever set in production!)")
# parser.add_argument(
#     "-t", "--testing",
#     action="store_true",
#     help="set, if you want to execute strichliste in unit testing mode")
# parser.add_argument(
#     "--reset",
#     action="store_true",
#     help="if set, clears any records and initializes the database with default values.")
# parser.add_argument(
#     "-p", "--port",
#     type=int,
#     default=5000)
# parser.add_argument(
#     "--host",
#     default="0.0.0.0")
# parser.add_argument(
#     "-db", "--dataBaseURI",
#     dest="db",
#     default="sqlite:////tmp/test.db"
# )
# parser.add_argument(
#     "-psk",
#     default="",
#     help="The secret key to authenticate transactions with. defaults to \"\" (empty string)"
# )
# args = parser.parse_args()
debug = False
testing = False
reset = False
port = 5000
host = "0.0.0.0"
psk = ""


class Config:
    DEBUG = debug
    TESTING = testing
    RESET = reset
    PORT = port
    HOST = host
    SQLALCHEMY_DATABASE_URI = "sqlite:///db.sqlite3"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PSK = psk

    SECRET_KEY = os.environ.get('FLASKBLOG_SECRET_KEY')
    # SQLALCHEMY_DATABASE_URI = os.environ.get('FLASKBLOG_DATABASE_URI')
