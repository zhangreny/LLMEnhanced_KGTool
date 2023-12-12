# 127.0.0.1:6888/index
import json

from flask import Blueprint
from flask import current_app
from neo4j import GraphDatabase

api_index = Blueprint("api_index", __name__, static_folder="../Frontend")

@api_index.route("/index")
def get_index():
    return api_index.send_static_file("index/index.html")

@api_index.route("/api/checkdbconnection")
def api_checkdbconnection():
    dbinfo = current_app.config["System_Config_dict"]["database"]
    if dbinfo["uri"] == "":
        return json.dumps({"status": "nodata"})
    else:
        try:
            driver = GraphDatabase.driver(dbinfo['uri'], auth=(dbinfo['username'], dbinfo['password']))
            with driver.session() as session:
                session.run("MATCH (x) RETURN x limit 1")
            current_app.config["Neo4j_Driver"] = driver
            return json.dumps({"status": "success", "resultdata": dbinfo})
        except Exception as e:
            print("#=========================#")
            print("[An Error Occurred]: " + str(e))
            print("===========================")
            return json.dumps({"status": "fail", "resultdata": dbinfo})
