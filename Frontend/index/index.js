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
            }
        }
    })
    getdomainsanddimensions()
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
            console.log(res)
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

// 获取数据库下的所有领域名和维度名
function getdomainsanddimensions() {
    const domainfinaladd = '<div class="cursor-pointer padding-5 marginleft-10 marginright-10 borderradius-6 hover-bg-darkyellow flex-row align-center" style=""><div class="borderradius-6 flex-row align-center justify-center bg-lightgrey marginright-5 marginleft-5" style="font-size: 16px;width: 18px;height: 18px; margin-top: 1px;">+</div><span style="margin-bottom: 2px;">创建新领域</span></div>'
    const dimensionfinaladd_1 = '<div onclick="CreateNewDomain(`'
    const dimensionfinaladd_2 = '`)" class="cursor-pointer padding-5 marginright-10 borderradius-6 hover-bg-darkyellow flex-row align-center" style="margin-left: 40px;"><div class="borderradius-6 flex-row align-center justify-center bg-lightgrey marginright-5 marginleft-5" style="font-size: 16px;width: 18px;height: 18px; margin-top: 3px;">+</div><span style="margin-top:1px">创建维度</span></div>'
    const domain_1 = '<div onclick="clickdomain(`'
    const domain_2 = '`)" id="'
    const domain_3 = '" class="cursor-pointer padding-5 marginleft-10 marginright-10 borderradius-6 hover-bg-darkyellow flex-row align-center" style=""><img onclick="ExpandandCollapse('
    const domain_4 = ')" src="/static/global/images/right.png" class="img-10 marginright-5 marginleft-5"><img src="/static/global/images/domain.png" class="img-20 marginright-5"><span style="margin-bottom: 2px;">'
    const domain_5 = '</span></div>'
    const dimension_1 = '<div id="'
    const dimension_2 = '" class="cursor-pointer padding-5 marginright-10 borderradius-6 hover-bg-darkyellow flex-row align-center" style="margin-left: 40px;"><img src="/static/global/images/dimension.png" class="img-16 marginleft-5" style="margin-right: 8px;"><span style="margin-bottom: 2px;">'
    const dimension_3 = '</span></div>'
    $.ajax({
        url: "/api/getdomainsanddimensions",
        method: "GET",
        success: function(res2) {
            const res = JSON.parse(res2)
            console.log(res)
            const container = $("div#domain-dimension-container").empty()
            if (res.domains.length > 0) {
                for (var i=0; i<res.domains.length; i++) {
                    var domaininfo = res.domains[i]
                    var domainid = "ly_" + domaininfo.id.toString()
                    $(domain_1 + domainid + domain_2 + domainid + domain_3 + domainid + domain_4 + domaininfo.name + domain_5).appendTo(container)
                    var dimensions = res.dimensions.filter(function(item) {
                        return item.domain == domaininfo.name
                    });
                    for (var j=0; j<dimensions.length; j++) {
                        var dimensionid = domainid + "_wd_" + dimensions[j].id.toString()
                        $(dimension_1 + dimensionid + dimension_2 + dimensions[j].name + dimension_3).appendTo(container)
                    }
                    $(dimensionfinaladd_1 + domainid + dimensionfinaladd_2).appendTo(container)
                }
            }
            $(domainfinaladd).appendTo(container)
        }
    })
}

// 点击领域
function clickdomain(domainid) {
    // 还原之前的样式
    const oldcontainers = document.getElementById("domain-dimension-container").querySelectorAll(".bg-darkgreen")
    if (oldcontainers.length > 0) {
        const oldcontainer = oldcontainers[0]
        oldcontainer.classList.remove("bg-darkgreen")
        oldcontainer.classList.add("hover-bg-darkyellow")
        oldcontainer.classList.remove("color-white")
        oldcontainer.getElementsByTagName("img")[0].setAttribute('src', '/static/global/images/right.png');
        oldcontainer.getElementsByTagName("img")[1].setAttribute('src', '/static/global/images/domain.png');
    }
    // 切换点击的样式，绿色背景
    const container = document.getElementById(domainid)
    container.classList.remove("hover-bg-darkyellow")
    container.classList.add("bg-darkgreen")
    container.classList.add("color-white")
    container.getElementsByTagName("img")[0].setAttribute('src', '/static/global/images/right-white.png');
    container.getElementsByTagName("img")[1].setAttribute('src', '/static/global/images/domain-white.png');

    const spanvalue = container.getElementsByTagName("span")[0].innerHTML
    document.getElementById("main-right-box").innerHTML = spanvalue
}