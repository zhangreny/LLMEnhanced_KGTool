# 127.0.0.1:6888/index

from flask import Blueprint
from flask import request
from flask import current_app
from neo4j import GraphDatabase

api_index = Blueprint("api_index", __name__, static_folder="../Frontend")

@api_index.route("/index")
def get_index():
    return api_index.send_static_file("index/index.html")