from flask import (
    Blueprint, flash, redirect, render_template, request, session, url_for, jsonify
)
from datetime import datetime, timedelta
from passfile.db.db import get_db

bp = Blueprint('dropModel', __name__)
def view(code):
    db = get_db()

    timestamp = datetime.now()
    expire = timestamp + timedelta(hours=24)
    
    data = db.execute(
        "SELECT f.filename, f.uuid from files f join links l on f.link_id = l.id where l.code = ? and l.expires_at < ?", (code, expire,)
    ).fetchall()
    if not data:
        return False
    else:
        return [dict(row) for row in data]

def get_link(code):
    db = get_db()
    data = db.execute(
        "SELECT * FROM links WHERE code = ?", (code,)
    ).fetchone()

    if not data:
        return False
    else:
        return data['id']
    
def create_file(data, id):
    db = get_db()
    try:
        db.execute(
            "INSERT INTO files (link_id, filename, uuid) VALUES (?, ?, ?)",
            (id, data['original_name'], data['uuid_name'])
        )
        db.commit()
    except Exception as e:
        print(e)
    else:
        return True
    
def create_link(data):
    db = get_db()
    timestamp = datetime.now()
    expire = timestamp + timedelta(hours=24)
    try:
        db.execute(
            "INSERT INTO links (code, hash, created_at, expires_at) VALUES (?, ?, ?, ?)", 
            (data['code'], data['hash'], timestamp, expire)
        )
        db.commit()

    except Exception as e:
        if "UNIQUE constraint" in str(e):
            return get_link(data['code'])
        else:
            print(e)
            return False
    else:
        return get_link(data['code'])

def upload(data):
    code_id = create_link(data)

    if not code_id:
        return False

    if not create_file(data, code_id):
        return False
    else:
        return True