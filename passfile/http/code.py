from datetime import datetime, timedelta
import uuid
from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from passfile.db.db import get_db

bp = Blueprint('code', __name__, url_prefix='/upload')
@bp.route('/', methods=['GET', 'POST'])
def upload_files():
    if request.method == 'POST':
        print(request.files)
        return { "status": "received" }

@bp.route('/getcode', methods=('GET', 'POST'))
def getuuid():
    if request.method == 'POST':
        code = str(uuid.uuid4()) [:8]
        data = { "code": code }
    return data
