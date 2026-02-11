# ml_service/db.py
import pymysql
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

def get_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "question_generation"),
        cursorclass=pymysql.cursors.DictCursor
    )
