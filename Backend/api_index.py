# 127.0.0.1:6888/index
import json

from flask import Blueprint
from flask import request
from flask import current_app
from neo4j import GraphDatabase
from copy import deepcopy

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

@api_index.route("/api/createnewdomain", methods=["POST"], strict_slashes=False)
def api_createnewdomain():
    try:
        newdomain = request.form["newdomain"]
        driver = current_app.config["Neo4j_Driver"]
        props = {
            "domain": newdomain,
            "领域名": newdomain,
            "领域描述": ""
        }
        with driver.session() as session:
            resultid = list(session.run("Create (x:领域名{name:'"+newdomain+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
        return json.dumps({"status": "success", "resultdata": {"name": newdomain, "id" :resultid}})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "添加领域名失败"})

@api_index.route("/api/createnewdimensionofdomain", methods=["POST"], strict_slashes=False)
def api_createnewdimensionofdomain():
    try:
        id = request.form["id"]
        newdimension = request.form["newdimension"]
        driver = current_app.config["Neo4j_Driver"] 
        with driver.session() as session:
            domainname = list(session.run("Match (x:领域名) where id(x)="+str(id)+" RETURN x.name as Name"))[0]["Name"]
        props = {
            "domain": domainname,
            "dimension": newdimension,
            "维度名": newdimension,
            "维度描述": ""
        }
        with driver.session() as session:
            tx = session.begin_transaction()
            try:
                resultid = list(tx.run("Create (x:维度名{name:'"+newdimension+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
                tx.run("MATCH (m) where id(m)=" + str(resultid) + " MATCH (n) where id(n)=" + str(id) + " "
                            "Create (n)-[r:领域内知识维度]->(m) return id(r) as relaid")
                tx.commit()
                return json.dumps({"status": "success", "resultdata": {"name": newdimension, "id" :resultid}})
            except Exception as e:
                tx.rollback()
                print("#=========================#")
                print("[An Error Occurred]: " + str(e))
                print("===========================")
                return json.dumps({"status": "fail", "resultdata": "添加领域名失败"})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "添加领域名失败"})
    
@api_index.route("/api/getclassesofdimension", methods=["POST"], strict_slashes=False)
def api_getclassesofdimension():
    domainid = request.form["domainid"]
    dimensionid = request.form["dimensionid"]
    driver = current_app.config["Neo4j_Driver"]
    try:
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取维度分类失败"})
    res = {}
    res["nodes"] = []
    res["links"] = []
    try:
        with driver.session() as session:
            dimensionnode = list(session.run("MATCH (n:维度名) where id(n)=" + dimensionid + " return n.name as Name, labels(n) as Label, id(n) as Id"))[0]
        node = {}
        node["name"] = dimensionnode["Name"]
        node["id"] = dimensionnode["Id"]
        node["label"] = dimensionnode["Label"][0]
        node["title"] = dimensionnode["Name"]
        node["children"] = []
        tree = node
        queue = [[dimensionnode["Id"], []]]  # 初始节点的ID，初始节点的children树无需寻找为空
        with driver.session() as session:
            while queue:
                currentpop = queue.pop(0)
                current_id, current_treepath = currentpop[0], currentpop[1]
                result = list(session.run("MATCH (m)-[:维度下分类]->(n:维度分类) WHERE ID(m)=" + str(current_id)+ " return n.name as Name, labels(n) as Label, id(n) as Id"))
                for i in range(len(result)):
                    record = result[i]
                    node = {}
                    node["name"] = record["Name"]
                    node["id"] = record["Id"]
                    node["label"] = record["Label"][0]
                    node["title"] = record["Name"]
                    node["children"] = []
                    current_treeroot = tree
                    for j in range(len(current_treepath)):
                        current_treeroot = current_treeroot["children"][current_treepath[j]]
                    current_treeroot["children"].append(node)
                    copied_current_treepath = deepcopy(current_treepath + [i])
                    queue.append([record["Id"], copied_current_treepath])
        res = []
        res.append(tree)
        return json.dumps({"status": "success", "resultdata": res})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取维度分类失败"})
