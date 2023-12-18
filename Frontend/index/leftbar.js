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
            }
            else if(res.status == "fail") {
                document.getElementById("db-uri").innerHTML = res.resultdata.uri
                document.getElementById("db-icon-fail").classList.remove("hidden")
                document.getElementById("db-icon-success").classList.add("hidden")
                document.getElementById("db-icon-nodb").classList.add("hidden")
                inputs[0].value = res.resultdata.uri
                inputs[1].value = res.resultdata.username
                inputs[2].value = res.resultdata.password
            }
            else if(res.status == "success") {
                document.getElementById("db-uri").innerHTML = res.resultdata.uri
                document.getElementById("db-icon-success").classList.remove("hidden")
                document.getElementById("db-icon-fail").classList.add("hidden")
                document.getElementById("db-icon-nodb").classList.add("hidden")
                inputs[0].value = res.resultdata.uri
                inputs[1].value = res.resultdata.username
                inputs[2].value = res.resultdata.password
                getdomainsanddimensions()
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
            }
        }
    })
}

// 根据json文件渲染
function renderdomainsanddimensions(res) {
    const dimensionfinaladd_1 = '<div id="'
    const dimensionfinaladd_2 = '" onclick="clickadddimension(`'
    const dimensionfinaladd_3 = '`)" class="cursor-pointer padding-5 marginright-10 borderradius-6 hover-bg-darkyellow flex-row align-center" style="margin-left: 40px;"><div class="borderradius-6 flex-row align-center justify-center bg-lightgrey marginright-5 marginleft-5" style="font-size: 16px;width: 18px;height: 18px; margin-top: 3px;">+</div><span style="margin-top:1px">创建维度</span></div>'
    const domain_1 = '<div onclick="clickdomain(`'
    const domain_2 = '`)" id="'
    const domain_3 = '" class="cursor-pointer padding-5 marginleft-10 marginright-10 borderradius-6 hover-bg-darkyellow flex-row align-center" style=""><img onclick="ExpandandCollapse(`'
    const domain_4 = '`)" src="/static/global/images/right.png" class="transform-90 img-10 marginright-5 marginleft-5"><img src="/static/global/images/domain.png" class="img-20 marginright-5"><span>'
    const domain_5 = '</span></div>'
    const dimension_1 = '<div onclick="clickdimension(`'
    const dimension_2 = '`)" id="'
    const dimension_3 = '" class="cursor-pointer padding-5 marginright-10 borderradius-6 hover-bg-darkyellow flex-row align-center" style="margin-left: 40px;"><img src="/static/global/images/dimension.png" class="img-16 marginleft-5" style="margin-right: 8px;"><span style="margin-bottom: 2px;">'
    const dimension_4 = '</span></div>'
    const container = $("div#domain-dimension-container")
    for (var i=0; i<res.domains.length; i++) {
        var domaininfo = res.domains[i]
        var domainid = "ly_" + domaininfo.id.toString()
        $(domain_1 + domainid + domain_2 + domainid + domain_3 + domainid + domain_4 + domaininfo.name + domain_5).appendTo(container)
        var dimensions = res.dimensions.filter(function(item) {
            return item.domain == domaininfo.name
        })
        for (var j=0; j<dimensions.length; j++) {
            var dimensionid = domainid + "_wd_" + dimensions[j].id.toString()
            $(dimension_1 + dimensionid + dimension_2 + dimensionid + dimension_3 + dimensions[j].name + dimension_4).appendTo(container)
        }
        $(dimensionfinaladd_1 + domainid + "_wd_add" + dimensionfinaladd_2 + domainid + dimensionfinaladd_3).appendTo(container)
    }
    clickdomain("ly_" + res.domains[0].id.toString())
}

// 获取数据库下的所有领域名和维度名
function getdomainsanddimensions() {
    $.ajax({
        url: "/api/getdomainsanddimensions",
        method: "GET",
        success: function(res2) {
            currentdomainid = -1
            currentdimensionid = -1
            const res = JSON.parse(res2)
            const container = $("div#domain-dimension-container").empty()
            if (res.domains.length > 0) {
                sessionStorage.setItem("domainsanddimensions", JSON.stringify(res))
                renderdomainsanddimensions(res)
            }
            const domainfinaladd = '<div id="ly-add" onclick="clickadddomain()" class="cursor-pointer padding-5 marginleft-10 marginright-10 borderradius-6 hover-bg-darkyellow flex-row align-center" style=""><div class="borderradius-6 flex-row align-center justify-center bg-lightgrey marginright-5 marginleft-5" style="font-size: 16px;width: 18px;height: 18px; margin-top: 1px;">+</div><span style="margin-bottom: 2px;">创建新领域</span></div>'
            $(domainfinaladd).appendTo(container)
        }
    })
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
    var htmlToInsert = '<div id="ly-add-container" class="padding-5 marginleft-10 marginright-10 borderradius-6 flex-row align-center" style=""><img src="/static/global/images/domain.png" class="img-20 marginright-5 marginleft-5"><input id="ly-add-newdomain" class="padding-5 borderradius-6 border-lightgrey marginright-10" style="width: calc(100% - 100px);height:15px;"><img onclick="submitnewdomain()" class="img-20 cursor-pointer" src="/static/global/images/square-right.png"><img onclick="cancel_clickadddomain_css()" class="img-22 marginleft-5 cursor-pointer" src="/static/global/images/square-wrong.png"></div>'
    var newElement = document.createElement('div')
    newElement.innerHTML = htmlToInsert
    targetDiv.parentNode.insertBefore(newElement, targetDiv)
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
    var lycontainer = document.getElementById(domainid+"_wd_add")
    lycontainer.style.display = "none"
    var htmlToInsert = '<div id="ly-wd-add-container" class="padding-5 marginleft-10 marginright-10 borderradius-6 flex-row align-center" style="margin-left: 40px;"><img src="/static/global/images/dimension.png" class="img-16 marginright-5 marginleft-5"><input id="ly-wd-add-newdimension" class="padding-5 borderradius-6 border-lightgrey marginright-10" style="width: calc(100% - 95px);height:15px;"><img onclick="submitnewdimension(`'+domainid+'`)" class="img-20 cursor-pointer" src="/static/global/images/square-right.png"><img onclick="cancel_clickadddimension_css(`'+domainid+'_wd_add`)" class="img-22 marginleft-5 cursor-pointer" src="/static/global/images/square-wrong.png"></div>'
    var newElement = document.createElement('div')
    newElement.innerHTML = htmlToInsert
    lycontainer.parentNode.insertBefore(newElement, lycontainer)
}

// 取消 <添加新维度> 后样式变化
function cancel_clickadddimension_css(containerid) {
    var addcontainer = document.getElementById("ly-wd-add-container")
    addcontainer.parentNode.removeChild(addcontainer)
    document.getElementById(containerid).style.display = "flex"
}

// 点击上传新领域
function submitnewdomain() {
    const newdomain = document.getElementById("ly-add-newdomain").value
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
                cancel_clickadddomain_css(domainid+"_wd_add")
            }
            else if(res.status == "success") {
                getdomainsanddimensions()
            }
        }
    })
}

// 点击上传新维度
function submitnewdimension(domainid) {
    const id = parseInt(domainid.slice(3))
    const newdimension = document.getElementById("ly-wd-add-newdimension").value
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
                cancel_clickadddimension_css()
            }
            else if(res.status == "success") {
                getdomainsanddimensions()
            }
        }
    })
}

// 点击领域
function clickdomain(domainid) {
    // 记录领域id
    if (currentdomainid != parseInt(domainid.slice(3))) {
        currentdomainid = parseInt(domainid.slice(3))
        currentdimensionid = -1
    }
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
    const container = document.getElementById(domainid)
    container.classList.remove("hover-bg-darkyellow")
    container.classList.add("bg-darkgreen")
    container.classList.add("color-white")
    container.getElementsByTagName("img")[0].setAttribute('src', '/static/global/images/right-white.png');
    container.getElementsByTagName("img")[1].setAttribute('src', '/static/global/images/domain-white.png');
    // 隐藏维度页，显示领域页
    document.getElementById("main-right-box-dimension").style.display = "none"
    document.getElementById("main-right-box-domain").style.display = "flex"
    // 替换题头领域名
    const spanvalue = container.getElementsByTagName("span")[0].innerHTML
    document.getElementById("detail-domain-name").innerHTML = spanvalue
    // 点击概览
    changedomainpage(0)
}

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
    document.getElementById("main-right-box-dimension").style.display = "flex"
    // 替换题头领域名
    const spanvalue = container.getElementsByTagName("span")[0].innerHTML
    document.getElementById("detail-dimension-name").innerHTML = spanvalue
    // 点击概览
    changedimensionpage(0)
}