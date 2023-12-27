// 用来记录当前选择的领域和维度
var currentdomainid = -1
var currentdimensionid = -1

window.onpageshow = function () {
    CheckDatabaseConnection();
}

// 检查数据库连接
function CheckDatabaseConnection() {
    $.ajax({
        url: "/api/checkdbconnection",
        method: "GET",
        success: function(res2) {
            const res = JSON.parse(res2)
            const container = document.getElementById("db-downcontainer")
            const inputs = container.getElementsByTagName("input")
            if(res.status == "nodata") {
                document.getElementById("db-uri").innerHTML = "暂无数据库"
                document.getElementById("db-icon-nodb").classList.remove("hidden")
                document.getElementById("db-icon-fail").classList.add("hidden")
                document.getElementById("db-icon-success").classList.add("hidden")
                document.getElementById("main-right-box-nodata").style.display = "flex"
                document.getElementById("main-right-box-domain").style.display = "none"
            }
            else if(res.status == "fail") {
                document.getElementById("db-uri").innerHTML = res.resultdata.uri
                document.getElementById("db-icon-fail").classList.remove("hidden")
                document.getElementById("db-icon-success").classList.add("hidden")
                document.getElementById("db-icon-nodb").classList.add("hidden")
                inputs[0].value = res.resultdata.uri
                inputs[1].value = res.resultdata.username
                inputs[2].value = res.resultdata.password
                document.getElementById("main-right-box-nodata").style.display = "flex"
                document.getElementById("main-right-box-domain").style.display = "none"
            }
            else if(res.status == "success") {
                document.getElementById("db-uri").innerHTML = res.resultdata.uri
                document.getElementById("db-icon-success").classList.remove("hidden")
                document.getElementById("db-icon-fail").classList.add("hidden")
                document.getElementById("db-icon-nodb").classList.add("hidden")
                inputs[0].value = res.resultdata.uri
                inputs[1].value = res.resultdata.username
                inputs[2].value = res.resultdata.password
                getdomains()
            }
        }
    })
}

// 点击数据库 编辑鉴权信息
function editdatabase() {
    document.getElementById("db-downcontainer").classList.remove("hidden")
}

// 关闭 编辑鉴权信息
function closeeditdatabase() {
    document.getElementById("db-downcontainer").classList.add("hidden")
}

// 更新数据库鉴权
function updatedatabase() {
    const container = document.getElementById("db-downcontainer")
    const inputs = container.getElementsByTagName("input")
    if(inputs[0].value == "" || inputs[1].value == "" || inputs[2].value == "") {
        document.getElementById("db-down-errmsg").innerHTML = "请补全字段"
        setTimeout(function(){
            document.getElementById("db-down-errmsg").innerHTML = ""
        }, 1500);
        return
    }
    document.getElementById("db-loading").classList.remove("hidden")

    var formFile = new FormData()
    formFile.append("uri", inputs[0].value)
    formFile.append("username", inputs[1].value)
    formFile.append("password", inputs[2].value)
    var data = formFile;
    $.ajax({
        url: "/api/updatedatabase",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            document.getElementById("db-loading").classList.add("hidden")
            if(res.status == "fail") {
                document.getElementById("db-down-errmsg").innerHTML = "连接数据库失败"
                setTimeout(function(){
                    document.getElementById("db-down-errmsg").innerHTML = ""
                }, 1500);
                document.getElementById("main-right-box-nodata").style.display = "flex"
                document.getElementById("main-right-box-domain").style.display = "none"
            }
            else if(res.status == "success") {
                const container = document.getElementById("db-downcontainer")
                const inputs = container.getElementsByTagName("input")
                document.getElementById("db-uri").innerHTML = res.resultdata.uri
                document.getElementById("db-icon-success").classList.remove("hidden")
                document.getElementById("db-icon-fail").classList.add("hidden")
                document.getElementById("db-icon-nodb").classList.add("hidden")
                inputs[0].value = res.resultdata.uri
                inputs[1].value = res.resultdata.username
                inputs[2].value = res.resultdata.password
                closeeditdatabase()
                getdomains()
            }
        }
    })
}

// 获取数据库下的所有领域名和维度名
function getdomains() {
    $.ajax({
        url: "/api/getdomains",
        method: "GET",
        success: function(res2) {
            // 初始化全局变量
            currentdomainid = -1
            currentdimensionid = -1
            const res = JSON.parse(res2)
            if (res.domains.length > 0) {
                const container = $("div#domainselects").empty()
                document.getElementById("main-right-box-nodata").style.display = "none"
                document.getElementById("main-right-box-domain").style.display = "flex"
                sessionStorage.setItem("domains", JSON.stringify(res))
                for (var i = 0; i < res.domains.length; i++) {
                    var domain = res.domains[i]
                    var domainname = domain.name
                    var domainid = domain.id
                    var domainselect = `
                        <div id="domainselects_`+domainid.toString()+`" onclick="domainselects_clickdomain('`+domainname+`',`+domainid.toString()+`)" class="cursor-pointer borderradius-6 width-100per hover-bg-lightgrey padding-10-5" style="padding-left:5px"><img src="/static/global/images/domain.png" class="img-18">
                            `+domainname+`
                        </div>
                    `
                    $(domainselect).appendTo(container)
                }
                domainselects_clickdomain(res.domains[0].name, res.domains[0].id)
            }
            else {
                document.getElementById("main-right-box-domain").style.display = "none"
                document.getElementById("main-right-box-nodata").style.display = "flex"
            }
        }
    })
}

function clicktochoosedomain() {
    document.getElementById("domainselects").style.display = "flex"
}

function domainselects_clickdomain(domainname, domainid) {
    closeadd()
    // 关闭弹框，填写字段
    document.getElementById("db-domain").innerHTML = domainname
    document.getElementById("domainselects").style.display = "none"
    // 更换样式
    if (currentdomainid!= -1) {
        document.getElementById("domainselects_"+currentdomainid.toString()).classList.remove("chosen-lightblue")
        document.getElementById("domainselects_"+currentdomainid.toString()).classList.add("hover-bg-lightgrey")
        document.getElementById("domainselects_"+currentdomainid.toString()).getElementsByTagName("img")[0].src = "/static/global/images/domain.png"
    }
    document.getElementById("domainselects_"+domainid.toString()).classList.remove("hover-bg-lightgrey")
    document.getElementById("domainselects_"+domainid.toString()).classList.add("chosen-lightblue")
    document.getElementById("domainselects_"+domainid.toString()).getElementsByTagName("img")[0].src = "/static/global/images/domain-blue.png"
    // 更新全局变量
    currentdomainid = domainid
    // 获取数据
    clickdomain(domainname, domainid)
}

function clickdomain(domainname, domainid) {
    // 隐藏维度页，显示领域页
    document.getElementById("main-right-box-domain").style.display = "flex"
    // 替换题头领域名
    document.getElementById("detail-domain-name").innerHTML = domainname
    // 点击概览
    domainclicktab(0)
}

function Showmsg(status, printstring) {
    const msg = document.getElementById("msg")
    msg.classList.remove("layui-anim-down")
    const imgs = msg.getElementsByTagName("img")
    if (status == "success") {
        imgs[1].classList.add("hidden")
        imgs[0].classList.remove("hidden")
        msg.getElementsByTagName("span")[0].innerHTML = printstring
    }
    else {
        imgs[0].classList.add("hidden")
        imgs[1].classList.remove("hidden")
        msg.getElementsByTagName("span")[0].innerHTML = printstring
    }
    msg.style.display = "flex"
    msg.classList.remove("layui-anim-fadeout")
    msg.classList.add("layui-anim-down")
    var halfWidth = msg.getBoundingClientRect().width / 2;
    msg.style.marginLeft = `-${halfWidth}px`;
    setTimeout(() => {
        msg.classList.add("layui-anim-fadeout")
    }, 2000)
}