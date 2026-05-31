from datetime import datetime, timedelta
import uuid, os
from passfile.db import db
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
        for file in (request.files.getlist('file')):
            extension = file.filename.rsplit('.', 1)[1]
            unique_file = {"original_name": file.filename, "uuid_name": f"{str(uuid.uuid4())}.{extension}", "code": code}
            try:
                file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], unique_file['uuid_name']))
            except Exception:
                return jsonify({ "status": "500" })
            else:
                store_data = store_entry(unique_file)
                if not store_data:
                    os.remove(f"{os.path.join(current_app.config['UPLOAD_FOLDER'])}/{unique_file['uuid_name']}")
                    return jsonify({"status": "500", "message": "Failed to save the file. Please try again."})
                else:
                    return jsonify({ "status": "200" })

@bp.route('/getcode', methods=('GET', 'POST'))
def getuuid():
    if request.method == 'POST':
        code = str(uuid.uuid4()) [:8]
        data = { "code": code }
    return data


def store_entry(data):
    db = get_db()
    timestamp = datetime.now()
    expire = timestamp + timedelta(hours=24)
    
    try:
        cursor = db.execute(
            "INSERT INTO links (code, created_at, expires_at) VALUES (?, ?, ?)",
            (data['code'], timestamp, expire)
        )

        db.execute(
            "INSERT INTO files (link_id, filename, uuid) VALUES (?, ?, ?)",
            (cursor.lastrowid, data['original_name'], data['uuid_name'])
        )
        db.commit()
        
    except Exception as e:
        print(e)
        return False
    else:
        return True