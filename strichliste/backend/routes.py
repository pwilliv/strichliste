from flask import Blueprint, flash, redirect, url_for, render_template, abort, request
from flask_login import login_required, current_user

backend = Blueprint('backend', __name__)


@backend.route("/admin")
@login_required
def management():
    return render_template('management.html')
