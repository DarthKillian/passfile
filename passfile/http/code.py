import uuid
from flask import (
    Blueprint, request, jsonify
)

bp = Blueprint('code', __name__, url_prefix='/code')

@bp.route('/gencode', methods=('GET', 'POST'))
def getuuid():
    if request.method == 'POST':
        code = str(uuid.uuid4()) [:8]
    return jsonify({"code": code})