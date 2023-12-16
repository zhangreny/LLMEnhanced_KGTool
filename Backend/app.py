import json

from flask import Flask
from flask import request
from flask import redirect
from neo4j import GraphDatabase

from api_index import api_index

# app实例
app = Flask(__name__, static_folder="../Frontend", static_url_path="/static")
app.register_blueprint(api_index)
app.config["System_Config_filepath"] = "config.json"
app.config["System_Config_dict"] = {}
app.config["Neo4j_driver"] = "Neo4j_Driver"

# 默认路由
@app.route("/")
def get_default():
    return redirect("/index")

# 主函数
if __name__ == '__main__':
    # 读入配置
    with open(app.config["System_Config_filepath"], "r", encoding="utf-8") as json_file:
        app.config["System_Config_dict"] = json.load(json_file)
    # 运行app
    app.run(host="127.0.0.1", port=6888)