from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for
)
from datetime import datetime, timedelta
from passfile.db.db import get_db

bp = Blueprint('dropModel', __name__)
def view():
    db = get_db()
    data = db.execute(
        "SELECT f.filename, f.uuid from files f join links l on f.link_id = l.id where l.code = '37a2cf36' and l.expires_at > '2026-05-31 13:27:32.267927'"
    ).fetchall()
    print(dict(data))
    # return "view"


def create(data, id=None):
    db = get_db()
    timestamp = datetime.now()
    expire = timestamp + timedelta(hours=24)
    print(expire);
    
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