import json
import time

from datetime import datetime
from flask import Flask
from flask import request
from flask import redirect
from neo4j import GraphDatabase
from hashlib import sha256

from api_index import api_index

# app实例
app = Flask(__name__, static_folder="../Frontend", static_url_path="/static")
app.register_blueprint(api_index)
app.config["System_Config_filepath"] = "config.json"
app.config["System_Config_dict"] = {}
app.config["System_Auth_filepath"] = "auth.json"
app.config["System_Auth_dict"] = {}
app.config["Neo4j_driver"] = "Neo4j_Driver"
app.config['USERNAME_TOKEN'] = {}

# 默认路由
@app.route("/")
def get_default():
    return redirect("/login")

# 登录界面
@app.route("/login")
def get_login():
    return app.send_static_file("login/login.html")

def getdatenow_string():
    return str(datetime.now()).split(".")[0]
@app.route("/api/login", methods=['POST'], strict_slashes=False)
def api_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        try:
            if username == "" or password == "":
                return json.dumps({'status':'fail','resultdata':'用户名和密码不可为空'})
            if username not in app.config["System_Auth_dict"]:
                return json.dumps({'status':'fail1','resultdata':'用户名不存在哦'})
            else:
                if app.config["System_Auth_dict"][username] != str(sha256(password.encode("utf-8")).hexdigest()):
                    return json.dumps({'status':'fail2','resultdata':'密码输入错误哦'})
                else:
                    timenow = getdatenow_string()
                    token = sha256(timenow.encode('utf-8')).hexdigest() 
                    app.config['USERNAME_TOKEN'][token] = username
                    return json.dumps({'status':'success','resultdata':'登录成功','token':token})
        except Exception as e:
            print("#=========================#")
            print("[An Error Occurred]: " + str(e))
            print("===========================")
            return json.dumps({'status':'fail','resultdata':'用户登录出现bug了'})

# 主函数
if __name__ == '__main__':
    # 读入配置
    with open(app.config["System_Config_filepath"], "r", encoding="utf-8") as json_file:
        app.config["System_Config_dict"] = json.load(json_file)
    # 读入用户的密码文件
    with open(app.config["System_Auth_filepath"], "r", encoding="utf-8") as json_file:
        app.config["System_Auth_dict"] = json.load(json_file)
    # 运行app
    app.run(host="0.0.0.0", port=6888)
