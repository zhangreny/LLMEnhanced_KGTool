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
            resultid = list(session.run("match (x:领域名{name:'"+newdomain+"'}) RETURN id(x) as id"))
        if len(resultid) > 0:
            return json.dumps({"status": "fail", "resultdata": "知识库中已存在此领域名"})
        with driver.session() as session:
            resultid = list(session.run("Create (x:领域名{name:'"+newdomain+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
        return json.dumps({"status": "success"})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": str(e)})

@api_index.route("/api/createnewdimensionofdomain", methods=["POST"], strict_slashes=False)
def api_createnewdimensionofdomain():
    try:
        id = request.form["id"]
        newdimension = request.form["newdimension"]
        try:
            description = request.form["description"]
        except:
            description = ""
        driver = current_app.config["Neo4j_Driver"] 
        with driver.session() as session:
            domainname = list(session.run("Match (x:领域名) where id(x)="+str(id)+" RETURN x.name as Name"))[0]["Name"]
        with driver.session() as session:
            resultid = list(session.run("match (x:维度名{name:'"+newdimension+"'}) where x.domain='" + domainname + "' RETURN id(x) as id"))
        if len(resultid) > 0:
            return json.dumps({"status": "fail", "resultdata": "领域内已存在此维度名"})
        props = {
            "domain": domainname,
            "dimension": newdimension,
            "维度名": newdimension,
            "维度描述": description
        }
        with driver.session() as session:
            tx = session.begin_transaction()
            try:
                resultid = list(tx.run("Create (x:维度名{name:'"+newdimension+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
                tx.run("MATCH (m) where id(m)=" + str(resultid) + " MATCH (n) where id(n)=" + str(id) + " "
                            "Create (n)-[r:领域内知识维度]->(m) return id(r) as relaid")
                tx.commit()
                return json.dumps({"status": "success"})
            except Exception as e:
                tx.rollback()
                print("#=========================#")
                print("[An Error Occurred]: " + str(e))
                print("===========================")
                return json.dumps({"status": "fail", "resultdata": str(e)})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": str(e)})
    
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

@api_index.route("/api/addsonclass", methods=["POST"], strict_slashes=False)
def api_addsonclass():
    domainid = request.form["domainid"]
    fatherid = request.form["fatherid"]
    dimensionid = request.form["dimensionid"]
    newnodename = request.form["newnodename"]
    driver = current_app.config["Neo4j_Driver"]
    try:
        with driver.session() as session:
            domainname = list(session.run("Match (n) where id(n)=" + domainid + " return n.name as Name"))[0]["Name"]
            dimensionname = list(session.run("Match (n) where id(n)=" + dimensionid + " return n.name as Name"))[0]["Name"]
        props = {}
        props["domain"] = domainname
        props["dimension"] = dimensionname
        props["维度分类名"] = newnodename
        props["维度分类来源"] = "手动分类"
        with driver.session() as session:
            tx = session.begin_transaction()
            try:
                newnode = list(tx.run("Create (x:维度分类{name:'"+ newnodename+ "'}) set x+=$props RETURN id(x) as Id", props=props))[0]
                relationid = list(tx.run("MATCH (m) where id(m)=" + str(newnode["Id"]) + " MATCH (n) where id(n)=" + str(fatherid) + " "
                                        "Create (n)-[r:维度下分类]->(m) return id(r) as relaid"))[0]["relaid"]
                if relationid:
                    tx.commit()
            except Exception as e:
                print("#=========================#")
                print("[An Error Occurred]: " + str(e))
                print("===========================")
                tx.rollback()
                return json.dumps({"status": "fail", "resultdata": "添加分类失败"})
        with driver.session() as session:
            record = list(session.run("MATCH (n) WHERE id(n)=" + str(newnode["Id"]) + " return properties(n) AS Properties, n.name as Name, labels(n) as Label, id(n) as Id"))[0]
        node = record["Properties"]
        node["id"] = record["Id"]
        node["label"] = record["Label"][0]
        return json.dumps({"status": "success", "resultdata": node})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "添加分类失败"})

@api_index.route("/api/deleteclassandsons", methods=["POST"], strict_slashes=False)
def api_deleteclassandsons():
    domainid = request.form["domainid"]
    dimensionid = request.form["dimensionid"]
    node_id = int(request.form["data_id"])
    driver = current_app.config["Neo4j_Driver"]
    try:
        # 先获取要删除的所有节点和子节点，用队列
        queue = [node_id]
        tobedeleted = [node_id]
        relationname = "维度下分类"
        objlabel = "维度分类"
        with driver.session() as session:
            while queue:
                current_id = queue.pop(0)
                result = list(session.run("MATCH (m)-[:"+ relationname+ "]->(n:" + objlabel + ") WHERE ID(m)="+ str(current_id) + " return id(n) as Id"))
                for record in result:
                    queue.append(record["Id"])
                    tobedeleted.append(record["Id"])
        with driver.session() as session:
            tx = session.begin_transaction()
            try:
                for nodeid in tobedeleted:
                    result = list(tx.run("MATCH (n) where id(n)="+str(nodeid)+" detach delete n return count(*) AS deletedNodeCount"))[0]['deletedNodeCount']
                    if result == 0:
                        print("删除id=",nodeid,"节点的时候出错，删除操作全部回退")
                        tx.rollback()
                        return json.dumps({"status": "fail", "resultdata": "删除分类失败"})   
                    tx.commit()
                    return json.dumps({"status": "success"})
            except Exception as e:
                print("#=========================#")
                print("[An Error Occurred]: " + str(e))
                print("===========================")
                tx.rollback()
                return json.dumps({"status": "fail", "resultdata": "删除分类失败"})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "删除分类失败"})    
    
@api_index.route("/api/getontologyofclass", methods=["POST"], strict_slashes=False)
def api_getontologyofclass():
    classid = request.form["classid"]
    driver = current_app.config["Neo4j_Driver"]
    try:
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取分类本体失败"})
    res = {}
    res["nodes"] = []
    res["links"] = []
    try:
        with driver.session() as session:
            classnode = list(session.run("MATCH (n:维度分类) where id(n)=" + classid + " return n.name as Name, labels(n) as Label, id(n) as Id"))[0]
        node = {}
        node["name"] = classnode["Name"]
        node["id"] = classnode["Id"]
        node["label"] = classnode["Label"][0]
        node["title"] = classnode["Name"]
        node["children"] = []
        tree = node
        queue = [[classnode["Id"], []]]  # 初始节点的ID，初始节点的children树无需寻找为空
        with driver.session() as session:
            while queue:
                currentpop = queue.pop(0)
                current_id, current_treepath = currentpop[0], currentpop[1]
                result = list(session.run("MATCH (m)-[:分类本体]->(n:分类本体) WHERE ID(m)=" + str(current_id)+ " return n.name as Name, labels(n) as Label, id(n) as Id"))
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
    
@api_index.route("/api/getdomaingraph", methods=["POST"], strict_slashes=False)
def api_getdomaingraph():
    # 限制概览页最多展示多少层节点
    level = 1
    # 限制最多返回多少个关系
    maxrelations = 300
    domainid = request.form["domainid"]
    driver = current_app.config["Neo4j_Driver"]
    try:
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取领域下内容失败"})
    res = {}
    res["nodes"] = []
    res["links"] = []
    try:
        with driver.session() as session:
            domainnode = list(session.run("MATCH (n) where id(n)=" + domainid + " RETURN properties(n) AS Properties, labels(n) as Label, id(n) as Id"))[0]
        node = domainnode["Properties"]
        node["id"] = domainnode["Id"]
        node["label"] = domainnode["Label"][0]
        res['nodes'].append(node)
        # 先获取入度
        with driver.session() as session:
            result = list(session.run("MATCH (m)-[r]->(n) where id(n)=" + domainid + " RETURN properties(m) AS Properties, labels(m) as Label, id(m) as Id, properties(r) AS relaProperties, type(r) as relatype"))
        for i in range(len(result)):
            record = result[i]
            relation = record['relaProperties']
            relation['relaname'] = record['relatype']
            relation['source'] = record["Id"]
            relation['target'] = domainid
            if relation not in res["links"]:
                res['links'].append(relation)
            node = record["Properties"]
            node["id"] = record["Id"]
            node["label"] = record["Label"][0]
            if node not in res["nodes"]:
                res['nodes'].append(node)
            if len(res["links"]) >= maxrelations:
                return json.dumps({"status": "success", "resultdata": res})
        queue = [domainnode["Id"]]
        with driver.session() as session:
            for _ in range(level):
                currentlist = deepcopy(queue)
                queue = []
                for current_id in currentlist:
                    result = list(session.run("MATCH (m)-[r]->(n) WHERE ID(m)=" + str(current_id)+ " RETURN properties(n) AS Properties, labels(n) as Label, id(n) as Id, properties(r) AS relaProperties, type(r) as relatype"))
                    for i in range(len(result)):
                        record = result[i]
                        relation = record['relaProperties']
                        relation['relaname'] = record['relatype']
                        relation['source'] = current_id
                        relation['target'] = record["Id"]
                        if relation not in res["links"]:
                            res['links'].append(relation)
                        node = record["Properties"]
                        node["id"] = record["Id"]
                        node["label"] = record["Label"][0]
                        if node not in res["nodes"]:
                            res['nodes'].append(node)
                            queue.append(record["Id"])
                        if len(res["links"]) >= maxrelations:
                            return json.dumps({"status": "success", "resultdata": res})
        return json.dumps({"status": "success", "resultdata": res})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取维度分类失败"})
    
@api_index.route("/api/uploadclassestodimension", methods=["POST"], strict_slashes=False)
def api_uploadclassestodimension():
    try:
        dimensionname = request.form["dimensionname"]
        domainid = request.form["domainid"]
        clickedid = request.form["clickedid"]
        inputfile = request.files["file"]
        driver = current_app.config["Neo4j_Driver"]
        if not inputfile:
            return json.dumps({"status": "fail", "resultdata": "请上传非空分类文件"})
        if inputfile.filename.split(".")[-1] == "json":
            inputdict = json.loads(inputfile.read().decode("utf-8"))
            category_names = set()
            duplicate = []
            for item in inputdict:
                if item["分类名称"] in category_names:
                    duplicate.append(item['分类名称'])
                else:
                    category_names.add(item["分类名称"])
            if len(duplicate) > 0:
                return json.dumps({"status": "fail", "resultdata": "存在重复分类名称: "+str(duplicate)})
            ids = {}
            with driver.session() as session:
                tx = session.begin_transaction()
                try:
                    domainname = list(tx.run("MATCH (n) where id(n)=" + domainid + " RETURN n.name as Name"))[0]["Name"]
                    for item in inputdict:
                        if not ("所属父分类" in item and "分类名称" in item and "分类描述" in item):
                            tx.commit()
                            return json.dumps({"status": "fail", "resultdata": "不满足字段要求: 所属父分类，分类名称，分类描述"})
                        fathername = item["所属父分类"]
                        # 创建节点
                        props = item
                        del props["所属父分类"]
                        props["domain"] = domainname
                        props["dimension"] = dimensionname
                        resultid = list(tx.run("Create (x:维度分类{name:'"+props["分类名称"]+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
                        ids[props["分类名称"]] = resultid
                        # 创建关系
                        if fathername == "":
                            fatherid = clickedid
                        else:
                            fatherid = ids[fathername]
                        tx.run("MATCH (m) where id(m)=" + str(fatherid) + " MATCH (n) where id(n)=" + str(resultid) + " Create (m)-[r:维度下分类]->(n) return id(r) as relaid")
                    tx.commit()
                    return json.dumps({"status": "success"})
                except Exception as e:
                    tx.rollback()
                    print("#=========================#")
                    print("[An Error Occurred]: " + str(e))
                    print("===========================")
                    return json.dumps({"status": "fail", "resultdata": str(e)})
        else:
            return
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": str(e)})