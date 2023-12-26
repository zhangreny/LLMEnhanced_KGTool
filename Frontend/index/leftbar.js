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
























// 维度 样式的还原 
function returndimensiontoold(oldcontainer) {
    oldcontainer.classList.remove("bg-darkgreen")
    oldcontainer.classList.add("hover-bg-darkyellow")
    oldcontainer.classList.remove("color-white")
    oldcontainer.getElementsByTagName("img")[0].setAttribute('src', '/static/global/images/dimension.png');
}

// 维度 样式的还原 
function returndomaintoold(oldcontainer) {
    oldcontainer.classList.remove("bg-darkgreen")
    oldcontainer.classList.add("hover-bg-darkyellow")
    oldcontainer.classList.remove("color-white")
    oldcontainer.getElementsByTagName("img")[0].setAttribute('src', '/static/global/images/right.png');
    oldcontainer.getElementsByTagName("img")[1].setAttribute('src', '/static/global/images/domain.png');
}

// 点击折叠领域
function ExpandandCollapse(domainid) {
    const domain = document.getElementById(domainid)
    const dimension_str = domainid + "_wd_"
    if (domain.getElementsByTagName("img")[0].classList.contains("transform-90")) {
        const elements = document.querySelectorAll('#domain-dimension-container [id^="'+dimension_str+'"]')
        for (var i=0; i<elements.length; i++) {
            elements[i].style.display = "none"
        }
        domain.getElementsByTagName("img")[0].classList.remove("transform-90")
    } 
    else {
        const elements = document.querySelectorAll('#domain-dimension-container [id^="'+dimension_str+'"]')
        for (var i=0; i<elements.length; i++) {
            elements[i].style.display = "flex"
        }
        domain.getElementsByTagName("img")[0].classList.add("transform-90")
    }
}

// 点击 <添加新领域> 后样式变化
function clickadddomain_css() {
    var targetDiv = document.getElementById('ly-add')
    document.getElementById("ly-add").style.display = "none"
    var htmlToInsert = '<div id="ly-add-container" class="padding-5 marginleft-10 marginright-10 borderradius-6 flex-row align-center" style=""><img src="/static/global/images/domain.png" class="img-20 marginright-5 marginleft-5"><input onkeydown="domain_handlekeydown(event)" id="ly-add-newdomain" class="padding-5 borderradius-6 border-lightgrey marginright-10" style="width: calc(100% - 10px);height:15px;"><img onclick="submitnewdomain()" class="img-20 cursor-pointer" src="/static/global/images/square-right.png"><img onclick="cancel_clickadddomain_css()" class="img-22 marginleft-5 cursor-pointer" src="/static/global/images/square-wrong.png"><img class="img-22 marginleft-5 hidden" src="/static/global/images/loading.gif"></div>'
    var newElement = document.createElement('div')
    newElement.innerHTML = htmlToInsert
    targetDiv.parentNode.insertBefore(newElement, targetDiv)
    document.getElementById("ly-add-newdomain").focus()
}

// 取消 <添加新领域> 后样式变化
function cancel_clickadddomain_css() {
    var addcontainer = document.getElementById("ly-add-container")
    addcontainer.parentNode.removeChild(addcontainer)
    document.getElementById("ly-add").style.display = "flex"
}

// 点击 <添加新领域>
function clickadddomain() {
    clickadddomain_css()
}

// 点击 <添加新维度>
function clickadddimension(domainid) {
    var previousContextMenu = document.getElementById('ly-wd-add-container')
    if (previousContextMenu) {
        var containerid = previousContextMenu.getElementsByTagName("img")[2].getAttribute("onclick").split("`")[1]
        cancel_clickadddimension_css(containerid)
    }
    var lycontainer = document.getElementById(domainid+"_wd_add")
    lycontainer.style.display = "none"
    var htmlToInsert = '<div id="ly-wd-add-container" class="padding-5 marginleft-10 marginright-10 borderradius-6 flex-row align-center" style="margin-left: 40px;"><img src="/static/global/images/dimension.png" class="img-16 marginright-5 marginleft-5"><input onkeydown="dimension_handlekeydown(`'+domainid+'`, event)" id="ly-wd-add-newdimension" class="padding-5 borderradius-6 border-lightgrey marginright-10" style="width: calc(100% - 10px);height:15px;"><img onclick="submitnewdimension(`'+domainid+'`)" class="img-20 cursor-pointer" src="/static/global/images/square-right.png"><img onclick="cancel_clickadddimension_css(`'+domainid+'_wd_add`)" class="img-22 marginleft-5 cursor-pointer" src="/static/global/images/square-wrong.png"><img class="img-22 marginleft-5 hidden" src="/static/global/images/loading.gif"></div>'
    var newElement = document.createElement('div')
    newElement.innerHTML = htmlToInsert
    lycontainer.parentNode.insertBefore(newElement, lycontainer)
    document.getElementById("ly-wd-add-newdimension").focus()
}

// 取消 <添加新维度> 后样式变化
function cancel_clickadddimension_css(containerid) {
    var addcontainer = document.getElementById("ly-wd-add-container").parentNode
    addcontainer.parentNode.removeChild(addcontainer)
    document.getElementById(containerid).style.display = "flex"
}

// 点击上传新领域
function submitnewdomain() {
    const newdomain = document.getElementById("ly-add-newdomain").value
    if (newdomain == "") {
        return
    }
    const container = document.getElementById("ly-add-container")
    const imgs = container.getElementsByTagName("img")
    imgs[1].classList.add("hidden")
    imgs[2].classList.add("hidden")
    imgs[3].classList.remove("hidden")

    var formFile = new FormData()
    formFile.append("newdomain", newdomain)
    var data = formFile;
    $.ajax({
        url: "/api/createnewdomain",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            if(res.status == "fail") {
                Showmsg("fail", "添加领域 " + newdomain + " 失败：" + res.resultdata)
                cancel_clickadddomain_css()
            }
            else if(res.status == "success") {
                Showmsg("success", "添加领域 " + newdomain + " 成功")
                getdomainsanddimensions()
            }
        }
    })
}

// 点击上传新维度
function submitnewdimension(domainid) {
    const id = parseInt(domainid.slice(3))
    const newdimension = document.getElementById("ly-wd-add-newdimension").value
    if (newdimension == "") {
        return
    }
    const container = document.getElementById("ly-wd-add-container")
    const imgs = container.getElementsByTagName("img")
    imgs[1].classList.add("hidden")
    imgs[2].classList.add("hidden")
    imgs[3].classList.remove("hidden")

    var formFile = new FormData()
    formFile.append("id", id)
    formFile.append("newdimension", newdimension)
    var data = formFile;
    $.ajax({
        url: "/api/createnewdimensionofdomain",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            if(res.status == "fail") {
                Showmsg("fail", "添加维度 " + newdimension + " 失败：" + res.resultdata)
                cancel_clickadddimension_css(domainid + "_wd_add")
            }
            else if(res.status == "success") {
                Showmsg("success", "添加维度 " + newdimension + " 成功")
                getdomainsanddimensions()
            }
        }
    })
}

// 点击领域


// 点击维度
function clickdimension(dimensionid) {
    // 记录维度id
    currentdomainid = parseInt(dimensionid.split("_")[1])
    currentdimensionid = parseInt(dimensionid.split("_")[3])
    // 还原之前的样式
    const oldcontainers = document.getElementById("domain-dimension-container").querySelectorAll(".bg-darkgreen")
    if (oldcontainers.length > 0) {
        const oldcontainer = oldcontainers[0]
        if (oldcontainer.getElementsByTagName("img").length == 2) {
            returndomaintoold(oldcontainer)
        }
        else if (oldcontainer.getElementsByTagName("img").length == 1) {
            returndimensiontoold(oldcontainer)
        }
    }
    // 切换点击的样式，绿色背景
    const container = document.getElementById(dimensionid)
    container.classList.remove("hover-bg-darkyellow")
    container.classList.add("bg-darkgreen")
    container.classList.add("color-white")
    container.getElementsByTagName("img")[0].setAttribute('src', '/static/global/images/dimension-white.png');
    // 隐藏维度页，显示领域页
    document.getElementById("main-right-box-domain").style.display = "none"
    // 替换题头领域名
    const spanvalue = container.getElementsByTagName("span")[0].innerHTML
    document.getElementById("detail-dimension-name").innerHTML = spanvalue
    // 点击概览
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

function domain_handlekeydown(event) {
    if (event.key === "Enter") {
        submitnewdomain()
    }
}

function dimension_handlekeydown(domainid, event) {
    if (event.key === "Enter") {
        submitnewdimension(domainid)
    }
}