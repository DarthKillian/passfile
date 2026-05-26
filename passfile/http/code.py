from datetime import datetime, timedelta
import uuid
from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from passfile.db.db import get_db

dumb = {
    "uuid": uuid.uuid4()
}

bp = Blueprint('link', __name__, url_prefix='/upload')
@bp.route('/')
def hello():
    return dumb

@bp.route('/getcode', methods=('GET', 'POST'))
def getuuid():
    if request.method == 'POST':
        code = str(uuid.uuid4()) [:8]
        data = { "code": code }
    return data
