from datetime import datetime, timedelta
import uuid, os
from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for, jsonify, current_app
)
from werkzeug.security import check_password_hash, generate_password_hash

from passfile.db.db import get_db

bp = Blueprint('code', __name__, url_prefix='/upload')
@bp.route('/', methods=['GET', 'POST'])
def upload_files():
    if request.method == 'POST':
        code = request.form.get('code')
        print(code)
        for file in (request.files.getlist('file')):
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], file.filename))
        return jsonify({ "status": "received" })

@bp.route('/getcode', methods=('GET', 'POST'))
def getuuid():
    if request.method == 'POST':
        code = str(uuid.uuid4()) [:8]
        data = { "code": code }
    return data
