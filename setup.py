from setuptools import setup

setup(
    name="strichliste",
    packages=["strichliste"],
    include_package_data=True,
    install_requires=[
        "flask",
        "flask-sqlalchemy",
        "flask-login",
        'eventlet',
        "whitenoise",
        "requests",
        "selenium"
    ]
)
