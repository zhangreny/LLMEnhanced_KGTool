# 127.0.0.1:6888/index
import json
import pandas as pd
import os
import atexit

from datetime import datetime
from flask import Blueprint
from flask import request
from flask import send_file
from flask import current_app
from neo4j import GraphDatabase
from copy import deepcopy
from hashlib import sha256

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

@api_index.route("/api/getdomains")
def api_getdomains():
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
        with driver.session() as session:
            results = list(session.run("MATCH (x:领域名) RETURN x.name as Name, id(x) as id"))
        for result in results:
            domainname = result["Name"]
            domainid = result["id"]
            domains.append({"name": domainname, "id" :domainid})
        return json.dumps({"status": "success", "domains": domains})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取领域名失败"})

@api_index.route("/api/createnewdomain", methods=["POST"], strict_slashes=False)
def api_createnewdomain():
    try:
        newdomain = request.form["newdomain"]
        try:
            description = request.form["description"]
        except:
            description = ""
        driver = current_app.config["Neo4j_Driver"]
        props = {
            "domain": newdomain,
            "领域名": newdomain,
            "领域描述": description
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
        metakeys = request.form["metakeys"].split("\n")
        metakeys_after = []
        for i in range(len(metakeys)):
            tmp = metakeys[i].rstrip("\r")
            if tmp != "":
                metakeys_after.append(tmp)
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
            "维度描述": description,
            "维度素材元数据键": str(metakeys_after)
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
                result = list(session.run("MATCH (m)-[:子分类]->(n:维度分类) WHERE ID(m)=" + str(current_id)+ " return n.name as Name, labels(n) as Label, id(n) as Id"))
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
                result = list(session.run("MATCH (m)-[:本体子项]->(n:分类本体) WHERE ID(m)=" + str(current_id)+ " return n.name as Name, labels(n) as Label, id(n) as Id"))
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
    level = 3
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
    nodestmp = []
    res["nodes"] = []
    res["links"] = []
    try:
        with driver.session() as session:
            result = list(session.run("MATCH (m)-[r]->(n) where id(n)=" + domainid + " RETURN properties(m) AS Properties, labels(m) as Label, id(m) as Id, properties(r) AS relaProperties, type(r) as relatype"))
        for i in range(len(result)):
            record = result[i]
            relation = record['relaProperties']
            relation['relaname'] = record['relatype']
            relation['source'] = record["Id"]
            relation['target'] = domainid
            relation["level"] = 0
            if relation not in res["links"]:
                res['links'].append(relation)
            node = record["Properties"]
            node["id"] = record["Id"]
            node["label"] = record["Label"][0]
            if node not in nodestmp:
                nodestmp.append(node)
                node["level"] = 0
                res['nodes'].append(node)
            if len(res["links"]) >= maxrelations:
                return json.dumps({"status": "success", "resultdata": res})
        with driver.session() as session:
            domainnode = list(session.run("MATCH (n) where id(n)=" + domainid + " RETURN properties(n) AS Properties, labels(n) as Label, id(n) as Id"))[0]
        node = domainnode["Properties"]
        node["id"] = domainnode["Id"]
        node["label"] = domainnode["Label"][0]
        nodestmp.append(node)
        node["level"] = 1
        res['nodes'].append(node)
        queue = [domainnode["Id"]]
        with driver.session() as session:
            for j in range(level):
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
                        relation["level"] = j+1
                        if relation not in res["links"]:
                            res['links'].append(relation)
                        node = record["Properties"]
                        node["id"] = record["Id"]
                        node["label"] = record["Label"][0]
                        if node not in nodestmp:
                            nodestmp.append(node)
                            queue.append(record["Id"])
                            node["level"] = j+2
                            res['nodes'].append(node)
                        if len(res["links"]) >= maxrelations:
                            return json.dumps({"status": "success", "resultdata": res})
        return json.dumps({"status": "success", "resultdata": res})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取维度分类失败"})
    
def parse_tabbed_string(input_string):
    tab_count = 0
    rest_of_string = input_string
    for char in input_string:
        if char == '\t':
            tab_count += 1
        else:
            break
    rest_of_string = rest_of_string.lstrip('\t')
    return tab_count, rest_of_string
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
                if item["id"] in category_names:
                    duplicate.append(item['id'])
                else:
                    category_names.add(item["id"])
            if len(duplicate) > 0:
                return json.dumps({"status": "fail", "resultdata": "存在重复id: "+str(duplicate)})
            ids = {}
            with driver.session() as session:
                tx = session.begin_transaction()
                try:
                    domainname = list(tx.run("MATCH (n) where id(n)=" + domainid + " RETURN n.name as Name"))[0]["Name"]
                    for item in inputdict:
                        if not ("id" in item and "父分类id" in item and "元数据" in item and "其他属性" in item):
                            tx.rollback()
                            return json.dumps({"status": "fail", "resultdata": "不满足字段要求: id，父分类id，元数据，其他属性"})
                        # 创建节点
                        props = {}
                        props["元数据"] = str(item["元数据"])
                        props["其他属性"] = str(item["其他属性"])
                        props["domain"] = domainname
                        props["dimension"] = dimensionname
                        resultid = list(tx.run("Create (x:维度分类{name:'"+item["元数据"]["分类名称"]+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
                        ids[item["id"]] = resultid
                        # 创建关系
                        if item["父分类id"] == -1:
                            fatherid = clickedid
                        else:
                            fatherid = ids[item["父分类id"]]
                        tx.run("MATCH (m) where id(m)=" + str(fatherid) + " MATCH (n) where id(n)=" + str(resultid) + " Create (m)-[r:子分类]->(n) return id(r) as relaid")
                    tx.commit()
                    return json.dumps({"status": "success"})
                except Exception as e:
                    tx.rollback()
                    print("#=========================#")
                    print("[An Error Occurred]: " + str(e))
                    print("===========================")
                    return json.dumps({"status": "fail", "resultdata": str(e)})
        elif inputfile.filename.split(".")[-1] == "txt":
            tabnum_id_hashtable = {}
            inputstr = inputfile.read().decode("utf-8")
            lines = inputstr.split("\n")
            with driver.session() as session:
                tx = session.begin_transaction()
                try:
                    domainname = list(tx.run("MATCH (n) where id(n)=" + domainid + " RETURN n.name as Name"))[0]["Name"]
                    for l in lines:
                        line = l.rstrip("\r")
                        if line != "":
                            tabnum, phrase = parse_tabbed_string(line)
                        # 创建节点
                        props = {}
                        tmp = {"分类名称": phrase,"分类描述":"", "分类来源":""}
                        tmp2 = {}
                        props["元数据"] = str(tmp)
                        props["其他属性"] = str(tmp2)
                        props["domain"] = domainname
                        props["dimension"] = dimensionname
                        resultid = list(tx.run("Create (x:维度分类{name:'"+phrase+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
                        tabnum_id_hashtable[tabnum] = resultid
                        # 找父节点
                        if tabnum == 0:
                            fatherid = clickedid
                        else:
                            fatherid = tabnum_id_hashtable[tabnum-1]
                        tx.run("MATCH (m) where id(m)=" + str(fatherid) + " MATCH (n) where id(n)=" + str(resultid) + " Create (m)-[r:子分类]->(n) return id(r) as relaid")
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
    
@api_index.route("/api/getalltreesofdomain", methods=["POST"], strict_slashes=False)
def api_getalltreesofdomain():
    domainid = request.form["domainid"]
    driver = current_app.config["Neo4j_Driver"]
    try:
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取领域树状结构失败"})
    res = {}
    res["nodes"] = []
    res["links"] = []
    try:
        with driver.session() as session:
            domainnode = list(session.run("MATCH (n:领域名) where id(n)=" + domainid + " return n.name as Name, labels(n) as Label, id(n) as Id"))[0]
        node = {}
        node["name"] = domainnode["Name"]
        node["id"] = domainnode["Id"]
        node["label"] = domainnode["Label"][0]
        node["title"] = domainnode["Name"]
        node["children"] = []
        tree = node
        queue = [[domainnode["Id"], []]]  # 初始节点的ID，初始节点的children树无需寻找为空
        with driver.session() as session:
            while queue:
                currentpop = queue.pop(0)
                current_id, current_treepath = currentpop[0], currentpop[1]
                result = list(session.run("MATCH (m)-[r]->(n) WHERE ID(m)=" + str(current_id)+ " return n.name as Name, labels(n) as Label, id(n) as Id"))
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
        return json.dumps({"status": "fail", "resultdata": "获取领域树状结构失败"})
    
@api_index.route('/template_download/add_category_to_dimension/json')
def template_download_add_category_to_dimension_json():
    # 文件路径
    file_path = '../filesfordownload/JSON模板-维度下添加知识分类.zip'
    # 发送文件
    return send_file(file_path, as_attachment=True)

@api_index.route('/template_download/add_category_to_dimension/txt')
def template_download_add_category_to_dimension_txt():
    # 文件路径
    file_path = '../filesfordownload/TXT模板-维度下添加知识分类.txt'
    # 发送文件
    return send_file(file_path, as_attachment=True)

@api_index.route('/template_download/add_ontology_to_category/json')
def template_download_add_ontology_to_category_json():
    # 文件路径
    file_path = '../filesfordownload/JSON模板-为知识分类创建本体.zip'
    # 发送文件
    return send_file(file_path, as_attachment=True)

@api_index.route("/api/uploadontologytoclass", methods=["POST"], strict_slashes=False)
def api_uploadontologytoclass():
    try:
        dimensionname = request.form["dimensionname"]
        domainid = request.form["domainid"]
        clickedid = request.form["clickedid"]
        inputfile = request.files["file"]
        driver = current_app.config["Neo4j_Driver"]
        if not inputfile:
            return json.dumps({"status": "fail", "resultdata": "请上传非空本体文件"})
        if inputfile.filename.split(".")[-1] == "json":
            inputdict = json.loads(inputfile.read().decode("utf-8"))
            category_names = set()
            duplicate = []
            for item in inputdict:
                if item["id"] in category_names:
                    duplicate.append(item['id'])
                else:
                    category_names.add(item["id"])
            if len(duplicate) > 0:
                return json.dumps({"status": "fail", "resultdata": "存在重复id: "+str(duplicate)})
            ids = {}
            with driver.session() as session:
                tx = session.begin_transaction()
                try:
                    domainname = list(tx.run("MATCH (n) where id(n)=" + domainid + " RETURN n.name as Name"))[0]["Name"]
                    for item in inputdict:
                        if not ("id" in item and "父本体id" in item and "本体类型" in item and "本体属性" in item):
                            tx.rollback()
                            return json.dumps({"status": "fail", "resultdata": "不满足字段要求: id，父分类id，本体类型，本体属性"})
                        # 创建节点
                        props = {}
                        props["本体属性"] = str(item["本体属性"])
                        props["domain"] = domainname
                        props["dimension"] = dimensionname
                        label = item["本体类型"]
                        if label == "本体分类":
                            resultid = list(tx.run("Create (x:"+label+"{name:'"+item["本体属性"]["本体分类名"]+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
                        elif label == "本体属性":
                            resultid = list(tx.run("Create (x:"+label+"{name:'"+item["本体属性"]["本体属性名"]+"'}) set x+=$props RETURN id(x) as id", props=props))[0]["id"]
                        ids[item["id"]] = resultid
                        # 创建关系
                        if item["父本体id"] == -1:
                            fatherid = clickedid
                        else:
                            fatherid = ids[item["父本体id"]]
                        tx.run("MATCH (m) where id(m)=" + str(fatherid) + " MATCH (n) where id(n)=" + str(resultid) + " Create (m)-[r:本体子项]->(n) return id(r) as relaid")
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
    
@api_index.route("/api/getontologiesofcategory", methods=["POST"], strict_slashes=False)
def api_getontologiesofcategory():
    categoryid = request.form["categoryid"]
    driver = current_app.config["Neo4j_Driver"]
    try:
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "数据库连接失败"})
    res = {}
    res["nodes"] = []
    res["links"] = []
    try:
        with driver.session() as session:
            dimensionnode = list(session.run("MATCH (n) where id(n)=" + categoryid + " return n.name as Name, labels(n) as Label, id(n) as Id"))[0]
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
                result = list(session.run("MATCH (m)-[:本体子项]->(n) WHERE ID(m)=" + str(current_id)+ " return n.name as Name, labels(n) as Label, id(n) as Id"))
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
        return json.dumps({"status": "success", "resultdata": res[0]["children"]})
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "获取维度分类失败"}) 

def delete_temp_file(filepath):
    if os.path.exists(filepath):
        os.remove(filepath)
@api_index.route('/template_download/add_material_to_category/xls')
def template_download_add_material_to_category_xls():
    categoryid = request.args.get('categoryid')
    # 获取本体结构，生成文件
    driver = current_app.config["Neo4j_Driver"]
    try:
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "数据库连接失败"})
    columns = []
    datas = []
    try:
        with driver.session() as session:
            dimensionnode = list(session.run("MATCH (n) where id(n)=" + categoryid + " return n.name as Name, labels(n) as Label, id(n) as Id, n.dimension as Dimension, n.domain as Domain"))[0]
        queue = [dimensionnode]  # 初始节点的ID，初始节点的children树无需寻找为空
        with driver.session() as session:
            metakeys = eval(list(session.run("MATCH (n:维度名) where n.domain='" + dimensionnode["Domain"] + "' return properties(n) as Properties"))[0]["Properties"]["维度素材元数据键"])
        columns.append("=====================素材元数据=====================")
        datas.append("=====请输入对应信息=====")
        for i in range(len(metakeys)):
            columns.append(metakeys[i])
            datas.append("")
        columns.append("=====================素材本体分类和属性=====================")
        datas.append("=====本体属性要求值=====")
        with driver.session() as session:
            while queue:
                record = queue.pop(0)
                if record["Label"][0] == "本体属性":
                    properties = eval(record["Properties"]["本体属性"])
                    columns.append(properties["本体属性名"])
                    datas.append(properties["属性值要求"])
                elif record["Label"][0] == "本体分类":
                    properties = eval(record["Properties"]["本体属性"])
                    columns.append(properties["本体分类名"])
                    datas.append("本体分类，无需填写")
                result = list(session.run("MATCH (m)-[:本体子项]->(n) WHERE ID(m)=" + str(record["Id"])+ " return n.name as Name, labels(n) as Label, id(n) as Id, properties(n) as Properties"))
                for i in range(len(result)):
                    queue.insert(0, result[len(result) - 1 - i])
    except Exception as e:
        print("#=========================#")
        print("[An Error Occurred]: " + str(e))
        print("===========================")
        return json.dumps({"status": "fail", "resultdata": "导出分类文件失败"}) 
    # 把生成的本体文件返回给他
    filepath = sha256(str(datetime.now()).split(".")[0].encode('utf-8')).hexdigest() 
    df = pd.DataFrame(list(zip(columns, datas)),columns=None)
    df.to_excel('../tmp/'+filepath+'.xls', index=False, header=False)
    return send_file('../tmp/'+filepath+'.xls', as_attachment=True)