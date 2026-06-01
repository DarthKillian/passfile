from datetime import datetime, timedelta
import uuid, os

from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for, jsonify, current_app
)
from werkzeug.security import check_password_hash, generate_password_hash

from passfile.models import dropModel

bp = Blueprint('drop', __name__, url_prefix='/drop')
@bp.route('/upload', methods=['GET', 'POST'])
def upload_files():
    if request.method == 'POST':
        code = request.form.get('code')
        for file in (request.files.getlist('file')):
            extension = file.filename.rsplit('.', 1)[1]
            unique_file = {"original_name": file.filename, "uuid_name": f"{str(uuid.uuid4())}.{extension}", "code": code}
            try:
                file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], unique_file['uuid_name']))
            except Exception:
                return jsonify({ "status": "500", "message": "Failed to save the file. Please try again." })
            else:
                create_file = dropModel.create(unique_file, 1234)
                if not create_file:
                    os.remove(f"{os.path.join(current_app.config['UPLOAD_FOLDER'])}/{unique_file['uuid_name']}")
                    return jsonify({"status": "500", "message": "Failed to save the file. Please try again."})
                else:
                    return jsonify({ "status": "200" })
