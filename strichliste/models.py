from flask import current_app
from datetime import datetime
from strichliste.extensions import db, login_manager, admin
from flask_login import UserMixin
#from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
import jwt
from flask_admin.contrib.sqla import ModelView


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    password = db.Column(db.String(60), nullable=False)
    admin = db.Column(db.Boolean, nullable=False, default=False)

    def get_reset_token(self, expiration=1800):
        reset_token = jwt.encode(
            {
                "confirm": self.id,
                "exp": datetime.datetime.now(tz=datetime.timezone.utc)
                       + datetime.timedelta(seconds=expiration)
            },
            current_app.config['SECRET_KEY'],
            algorithm="HS256"
        )
        return reset_token

    @staticmethod
    def verify_reset_token(self, token):
        try:
            data = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                leeway=datetime.timedelta(seconds=10),
                algorithms=["HS256"]
            )
        except:
            return False
        if data.get('confirm') != self.id:
            return False
        self.confirmed = True
        db.session.add(self)
        return True

        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            user_id = s.loads(token)['user_id']
        except:
            return None
        return User.query.get(user_id)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}', '{self.image_file}')"


class Consumer(db.Model):
    # models a user by their name.
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    locked = db.Column(db.Boolean, nullable=False)

    def __init__(self, name):
        self.name = name
        self.locked = False

    def __repr__(self):
        return '<Consumer %r>' % self.name


admin.add_view(ModelView(Consumer, db.session))


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.Text, unique=True, nullable=False)
    price = db.Column(db.Float, nullable=False)

    def __init__(self, name: str, price: float):
        self.name = name
        self.price = price

    def __repr__(self):
        return "<Category %r>" % self.name


admin.add_view(ModelView(Category, db.session))


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    bulk_size = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    category = db.relationship("Category", backref="products")

    def __init__(self, name: str, category: Category, bulk_size: int = 0):
        self.name = name
        self.bulk_size = bulk_size
        self.category = category

    def __repr__(self):
        return "<Product %r>" % self.name


admin.add_view(ModelView(Product, db.session))


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False)
    consumer_id = db.Column(db.Integer, db.ForeignKey("consumer.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    user = db.relationship("Consumer", backref="transactions")
    category = db.relationship("Category", backref="transactions")
    amount = db.Column(db.Integer, nullable=False)
    undone = db.Column(db.Boolean, nullable=False)

    def __init_(self, consumer: Consumer, category: Category, timestamp: datetime, amount: int = 1) -> None:
        self.undone = False
        self.consumer = consumer
        self.category = category
        self.timestamp = timestamp
        self.amount = amount

    def price(self):
        return self.category.price * self.amount

    def __repr__(self):
        return "<Transaction %r - %r>" % (self.consumer.name, self.product.name)
