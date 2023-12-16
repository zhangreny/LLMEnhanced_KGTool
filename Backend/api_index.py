# 127.0.0.1:6888/index
import json

from flask import Blueprint
from flask import request
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
        
@api_index.route("/api/updatedatabase", methods=["POST"], strict_slashes=False)
def api_updatedatabase():
    dbinfo = request.form
    try:
        driver = GraphDatabase.driver(dbinfo['uri'], auth=(dbinfo['username'], dbinfo['password']))
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
        current_app.config["Neo4j_Driver"] = driver
        current_app.config["System_Config_dict"]["database"] = dbinfo
        with open(current_app.config["System_Config_filepath"], 'w', encoding="utf-8") as file:
            json.dump(current_app.config["System_Config_dict"], file, indent=4, ensure_ascii=False)
        return json.dumps({"status": "success", "resultdata": dbinfo})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": dbinfo})

@api_index.route("/api/getdomainsanddimensions")
def api_getdomainsanddimensions():
    try:
        driver = current_app.config["Neo4j_Driver"]
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "dbfail"})
    try:
        domains = []
        dimensions = []
        with driver.session() as session:
            results = list(session.run("MATCH (x:领域名) RETURN x.name as Name, id(x) as id"))
        for result in results:
            domainname = result["Name"]
            domainid = result["id"]
            domains.append({"name": domainname, "id" :domainid})
            with driver.session() as session:
                dimensionres = list(session.run("MATCH (x:维度名) where x.domain='" + domainname + "' "
                                                "RETURN x.name as Name, id(x) as id"))
            for dimension in dimensionres:
                dimensions.append({"name": dimension["Name"], "domain":domainname, "id": dimension["id"]})
        return json.dumps({"status": "success", "domains": domains, "dimensions": dimensions})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取领域名和维度名失败"})