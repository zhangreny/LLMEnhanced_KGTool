// 点击 概览/设置
function domainclicktab(index) {
    // 选项卡样式切换
    const tabs = document.querySelectorAll('#main-right-box-domain [name="domaintab"]')
    for (var i=0; i<tabs.length; i++){
        tabs[i].classList.remove("chosen-lightblue")
        tabs[i].classList.add("hover-bg-lightgrey")
    }
    tabs[index].classList.remove("hover-bg-lightgrey")
    tabs[index].classList.add("chosen-lightblue")
    // 展示内容切换
    const pages = document.querySelectorAll('#main-right-box-domain [id^="domain-page-"]')
    for (var i=0; i<pages.length; i++){
        pages[i].style.display = "none"
    }
    pages[index].style.display = "flex"
    // 内容切换
    if (index == 0) {
        GetDomainGraph()
        GetDomainTree()
    }
}

// 点击概览后 获取所选领域内的知识图谱
function GetDomainGraph() {
    // 进入loading框
    document.getElementById("domain-graph-error").style.display = "none"
    document.getElementById("domain-graph").style.display = "none"
    document.getElementById("domain-graph-loading").style.display = "flex"
    var formFile = new FormData()
    formFile.append("domainid", currentdomainid)
    var data = formFile;
    $.ajax({
        url: "/api/getdomaingraph",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            if(res.status == "fail") {
                document.getElementById("domain-graph-loading").style.display = "none"
                document.getElementById("domain-graph").style.display = "none"
                document.getElementById("domain-graph-error").style.display = "flex"
            }
            else if(res.status == "success") {
                sessionStorage.setItem("domaingraphjson", res.resultdata)
                document.getElementById("domain-graph-loading").style.display = "none"
                document.getElementById("domain-graph-error").style.display = "none"
                document.getElementById("domain-graph").style.display = "flex"
                drawgraphfromjson("domain-graph", res.resultdata)
            }
        }
    })
}

// 获取领域树状结构
function GetDomainTree() {
    var formFile = new FormData()
    formFile.append("domainid", currentdomainid)
    var data = formFile;
    $.ajax({
        url: "/api/getalltreesofdomain",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            if(res.status == "fail") {
                /*
                document.getElementById("domain-graph-loading").style.display = "none"
                document.getElementById("domain-graph").style.display = "none"
                document.getElementById("domain-graph-error").style.display = "flex"
                */
            }
            else if(res.status == "success") {
                currentnodeid = -1
                const container = $("div#domain-tree").empty()
                sessionStorage.setItem("domaintreejson", JSON.stringify(res.resultdata))
                res.resultdata[0].level = 0
                let queue = res.resultdata.slice()
                addclasses_classid = -1
                while (queue.length > 0) {
                    let item = queue.shift()
                    // 绘制
                    var classstr = `
                        <div id="domain_tree_`+item.id.toString()+`" onclick="domaintree_click(`+item.id.toString()+`, '`+item.name+`')" class="borderradius-6 padding-10-5 cursor-pointer hover-bg-darkyellow" style="margin-left: `+(item.level*24).toString()+`px">
                            `+ item.name +`
                        </div>
                    `
                    $(classstr).appendTo(container)
                    if (item.children && item.children.length > 0) {
                        for (var j=0; j<item.children.length; j++) {
                            item.children[item.children.length - 1 - j].level = item.level + 1
                            queue.unshift(item.children[item.children.length - 1 - j])
                        }
                    }
                }
                domaintree_click(res.resultdata[0].id, res.resultdata[0].name)
            }
        }
    })
}

function domaintree_click(id, name) {
    if (currentnodeid != -1) {
        document.getElementById("domain_tree_"+currentnodeid.toString()).classList.remove("chosen-darkgreen")
        document.getElementById("domain_tree_"+currentnodeid.toString()).classList.add("hover-bg-darkyellow")
    }
    document.getElementById("domain_tree_"+id.toString()).classList.remove("hover-bg-darkyellow")
    document.getElementById("domain_tree_"+id.toString()).classList.add("chosen-darkgreen")
    GetrelatedGraph(id)
    currentnodeid = id
}

// 获取相邻节点的id
function GetrelatedGraph(id) {
    document.getElementById("domain-graph-error").style.display = "none"
    document.getElementById("domain-graph").style.display = "none"
    document.getElementById("domain-graph-loading").style.display = "flex"
    var formFile = new FormData()
    formFile.append("domainid", id)
    var data = formFile;
    $.ajax({
        url: "/api/getdomaingraph",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            if(res.status == "fail") {
                document.getElementById("domain-graph-loading").style.display = "none"
                document.getElementById("domain-graph").style.display = "none"
                document.getElementById("domain-graph-error").style.display = "flex"
            }
            else if(res.status == "success") {
                sessionStorage.setItem("domaingraphjson", res.resultdata)
                document.getElementById("domain-graph-loading").style.display = "none"
                document.getElementById("domain-graph-error").style.display = "none"
                document.getElementById("domain-graph").style.display = "flex"
                drawgraphfromjson("domain-graph", res.resultdata)
            }
        }
    })
}

function drawgraphfromjson(divid, nodesandlinks) {
    const tulicontainer = $("div#domain-graph-tuli").empty() // 清除图例
    $('<div>图例</div><div id="domain-graph-tuli-container"></div>').appendTo(tulicontainer)
    var alllabels = []
    for(var i=0; i<nodesandlinks.nodes.length; i++) {
        if(alllabels.indexOf(nodesandlinks.nodes[i].label) == -1) {
            alllabels.push(nodesandlinks.nodes[i].label);
        }
    }
    var colors = d3.scaleOrdinal().domain(d3.range(alllabels.length)).range(d3.schemeCategory10)
    Array.from(alllabels).forEach(function (record, index) {
        $('<div class="flex-row align-center paddingtop-5"><div class="marginright-5" style="width:10px;height:10px;border-radius:5px;background-color:'+colors(index)+';margin-top:1px;"></div><div class="fontsize-12">'+record+'</div></div>').appendTo(tulicontainer);
    })
    
    $("div#"+divid).empty()
    const nodes = nodesandlinks.nodes
    const links = nodesandlinks.links
    const width = document.getElementById(divid).getBoundingClientRect().width - 2
    const height = document.getElementById(divid).getBoundingClientRect().height - 2

    // zoom缩放
    const zoom = d3.zoom().scaleExtent([0.1, 10])
    .on("zoom", function () {
        g.attr("transform", d3.event.transform)
    })
    .filter(function () {
        return !d3.event.button && d3.event.type !== "dblclick";
    })

    // 画布
    const svg = d3.select("#"+divid)
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .call(zoom)
    var g = svg.append("g")

    // 力导向
    const simulation = d3.forceSimulation()
    simulation.nodes(nodes)
    simulation.force("link", d3.forceLink(links).id(function(d) { return d.id; }).distance(120))
    simulation.force("charge", d3.forceManyBody().strength(50))
    simulation.force("center", d3.forceCenter(width / 2, height / 2))
    simulation.force("x", d3.forceX().strength(0.1))
    simulation.force("y", d3.forceY().strength(0.25))
    simulation.alphaDecay(0.2)
    simulation.force("collide", d3.forceCollide().radius(70))
    simulation.tick(25)

    // 边长
    const link = g.append("g").selectAll(".domain-link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "domain-link")
        .attr("marker-end", "url(#direction)")
        .attr("id", d => divid + d.source.id + "_" + d.relaname + "_" + d.target.id)

    // 边上的箭头,分正反两种
    const positiveMarker = svg.append("marker")
        .attr("id", "positiveMarker")
        .attr("orient", "auto")
        .attr("stroke-width", 2)
        .attr("markerUnits", "strokeWidth")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 42)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .append("path")
        .attr("d", "M 0 -5 L 10 0 L 0 5")
        .attr('fill', '#999')
        .attr("stroke-opacity", 0.6);
    const negativeMarker = svg.append("marker")
        .attr("id", "negativeMarker")
        .attr("orient", "auto")
        .attr("stroke-width", 2)
        .attr("markerUnits", "strokeWidth")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", -32)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .append("path")
        .attr("d", "M 10 -5 L 0 0 L 10 5")
        .attr('fill', '#999')
        .attr("stroke-opacity", 0.6);

    const relanametest = g.append("g").selectAll("text")
        .data(links)
        .enter()
        .append("text")
        .attr("dy", "-2")
        .attr("class", "domain-relaname")
        .append('textPath')
        .attr(
            "xlink:href", d => "#" + divid + d.source.id + "_" + d.relaname + "_" + d.target.id
        )
        .attr("startOffset", "calc(50%)")
        .text(function (d) {
            if (d.relaname.length > 10) {
                return d.relaname.slice(0, 10) + "..."
            }
            return d.relaname
        })
    
    // 节点
    const node = g.append("g").selectAll(".domain-node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "domain-node")
        .attr("r", 20)
        .attr("id", d => divid + "Node" + d.id.toString())
        .attr("fill", function (d) {return colors(alllabels.indexOf(d.label))})
        .call(
            d3.drag()//相当于移动端的拖拽手势  分以下三个阶段
                .on('start', start)
                .on('drag', drag)
                .on('end', end)
        )
        .on("dblclick", function(d) {
            GetrelatedGraph(d.id)
        })
    function start(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }
    function drag(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    function end(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }

    // 节点名称
    const nodetest = g.append("g").selectAll("foreignObject")
        .data(nodes)
        .enter()
        .append("g")

    // 节点和边动起来
    simulation.on("tick", function () {
        // 边设置
        link.attr("d", function (d) {
            if (d.source.x < d.target.x) {
                return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y
            }
            else {
                return "M " + d.target.x + " " + d.target.y + " L " + d.source.x + " " + d.source.y
            }
        })
            .attr("marker-end", function (d) {
                if (d.source.x < d.target.x) {
                    return "url(#positiveMarker)"
                }
                else {
                    return null
                }
            })
            .attr("marker-start", function (d) {
                if (d.source.x < d.target.x) {
                    return null
                }
                else {
                    return "url(#negativeMarker)"
                }
            })
        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
        nodetest
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // 节点名称
    nodetest
        .append("foreignObject")
        .attr("class", "cursor-pointer")
        .style("pointer-events", "none")
        .attr("x", -15)
        .attr("y", -15)
        .attr("width", 30)
        .attr("height", 30)
        .append("xhtml:div")
        .attr("class", "flex-row align-center justify-center")
        .style("width", "100%")
        .style("height", "100%")
        .style("color", "white")
        .style("font-size", "8px")
        .style("padding", "3px")
        .style("overflow-wrap", "break-word")
        .style("word-break", "break-all")
        .style("text-align", "middle")
        .style("overflow", "hidden")
        .style("text-overflow", "ellipsis")
        .style("white-space", "nowrap")
        .text(function (d) {
            if (d.name.length > 3) {
                return d.name.slice(0, 3) + "..."
            }
            return d.name
        })
}

// 关闭创建窗口
function closeadd() {
    var imgs = document.getElementById("domain-graph-add-button").getElementsByTagName("img")
    document.getElementById("domain-graph-add").style.display = "none"
    imgs[1].classList.add("hidden")
    imgs[0].classList.remove("hidden")
}

// 打开创建窗口
function openadd() {
    var imgs = document.getElementById("domain-graph-add-button").getElementsByTagName("img")
    document.getElementById("domain-graph-add").style.display = "flex"
    imgs[0].classList.add("hidden")
    imgs[1].classList.remove("hidden")
    var container = document.getElementById("domain-graph-add")
}

// 在图的视图中添加知识
function domaingraphadd() {
    if (document.getElementById("domain-graph-add").style.display == "flex") {
        closeadd()
    }
    else if (document.getElementById("domain-graph-add").style.display == "none") {
        openadd()
    }

} 

// 关闭popup弹窗
function clickelsewhereclosepopup(event) {
    const containers = document.querySelectorAll('#popup [id^="popupcontainer-"]')
    if (!containers[0].contains(event.target)) {
        clickclosepopup()
    }
}

function clickclosepopup() {
    const containers = document.querySelectorAll('#popup [id^="popupcontainer-"]')
    for (var i=0; i<containers.length; i++) {
        containers[i].style.display = "none"
    }
    document.getElementById("popup").style.display = "none"
}

// 点击了添加新维度
function domain_clickadddomain() {
    const container = $("div#popup").empty()
    document.getElementById("popup").style.display = "flex"
    const adddomain = `
    <div id="popupcontainer-adddimension" class="borderradius-6 padding-25 bg-white flex-column" style="width: 450px;padding-left:30px;padding-bottom:10px">
        <!-- 标题和关闭按钮 -->
        <div class="width-100per flex-row align-center justify-between marginbottom-10">
            <span class="fontsize-20 fontweight-600">创建新领域</span>
            <div onclick="clickclosepopup()" class="cursor-pointer borderradius-6 padding-5 hover-bg-lightgrey flex-row align-center marginright-5"><img src="/static/global/images/close.png" class="img-22"></div>
        </div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
            领域名
        </div>
        <!-- 内容-输入框 -->
        <input id="popup-domain-adddimension-dimensionname" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);">
        <!-- 分割 -->
        <div class="width-100per" style="height:10px;"></div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
            领域描述
        </div>
        <!-- 内容-输入框 -->
        <textarea id="popup-domain-adddimension-description" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);height:100px;resize:none"></textarea>
        <!-- 错误信息和提交按钮 -->
        <div class="width-100per margintop-15 flex-row align-center justify-between" style="height:39px;">
            <div id="popup-domain-adddimension-errmsg" class="color-red fontsize-14" style="margin-bottom:6px"></div>
            <div class="flex-row align-center">
                <img id="popup-domain-adddimension-loading" src="/static/global/images/loading.gif" class="hidden img-18 marginright-10">
                <button onclick="domain_submitnewdomain()" type="button" class="layui-btn layui-btn-normal" style="width:70px;border-radius:6px;font-weight:600;height:28px;line-height:28px;">
                    保存
                </button>
            </div>
        </div> 
    </div>
    `
    $(adddomain).appendTo(container)
}

function domain_submitnewdomain() {
    document.getElementById("popup-domain-adddimension-errmsg").innerHTML = ""
    const domainname = document.getElementById("popup-domain-adddimension-dimensionname").value
    const description = document.getElementById("popup-domain-adddimension-description").value
    if (domainname == "") {
        document.getElementById("popup-domain-adddimension-errmsg").innerHTML = "请输入领域名"
        return
    } 
    var formFile = new FormData()
    formFile.append("newdomain", domainname)
    formFile.append("description", description)
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
                document.getElementById("popup-domain-adddimension-errmsg").innerHTML = res.resultdata
            }
            else if(res.status == "success") {
                clickclosepopup()
                Showmsg("success", "添加领域 " + domainname + " 成功")
                getdomains()
            }
        }
    })
}

// 点击了添加新维度
function domain_clickadddimension() {
    const container = $("div#popup").empty()
    document.getElementById("popup").style.display = "flex"
    const adddomain = `
    <div id="popupcontainer-adddimension" class="borderradius-6 padding-25 bg-white flex-column" style="width: 450px;padding-left:30px;padding-bottom:10px">
        <!-- 标题和关闭按钮 -->
        <div class="width-100per flex-row align-center justify-between marginbottom-10">
            <span class="fontsize-20 fontweight-600">创建维度</span>
            <div onclick="clickclosepopup()" class="cursor-pointer borderradius-6 padding-5 hover-bg-lightgrey flex-row align-center marginright-5"><img src="/static/global/images/close.png" class="img-22"></div>
        </div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
            所属领域
        </div>
        <!-- 内容-输入框 -->
        <input id="popup-domain-adddimension-domainname" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);">
        <!-- 分割 -->
        <div class="width-100per" style="height:10px;"></div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
            维度名
        </div>
        <!-- 内容-输入框 -->
        <input id="popup-domain-adddimension-dimensionname" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);">
        <!-- 分割 -->
        <div class="width-100per" style="height:10px;"></div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
            维度描述
        </div>
        <!-- 内容-输入框 -->
        <textarea id="popup-domain-adddimension-description" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);height:100px;resize:none"></textarea>
        <!-- 错误信息和提交按钮 -->
        <div class="width-100per margintop-15 flex-row align-center justify-between" style="height:39px;">
            <div id="popup-domain-adddimension-errmsg" class="color-red fontsize-14" style="margin-bottom:6px"></div>
            <div class="flex-row align-center">
                <img id="popup-domain-adddimension-loading" src="/static/global/images/loading.gif" class="hidden img-18 marginright-10">
                <button onclick="domain_submitnewdimension()" type="button" class="layui-btn layui-btn-normal" style="width:70px;border-radius:6px;font-weight:600;height:28px;line-height:28px;">
                    保存
                </button>
            </div>
        </div> 
    </div>
    `
    $(adddomain).appendTo(container)
    document.getElementById("popup-domain-adddimension-domainname").value = document.getElementById("detail-domain-name").innerHTML
    document.getElementById("popup-domain-adddimension-domainname").readOnly = true
}

function domain_submitnewdimension() {
    document.getElementById("popup-domain-adddimension-errmsg").innerHTML = ""
    const domainid = currentdomainid
    const domainname = document.getElementById("popup-domain-adddimension-domainname").value
    const dimensionname = document.getElementById("popup-domain-adddimension-dimensionname").value
    const description = document.getElementById("popup-domain-adddimension-description").value
    if (dimensionname == "") {
        document.getElementById("popup-domain-adddimension-errmsg").innerHTML = "请输入维度名"
        return
    } 
    var formFile = new FormData()
    formFile.append("id", domainid)
    formFile.append("newdimension", dimensionname)
    formFile.append("description", description)
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
                document.getElementById("popup-domain-adddimension-errmsg").innerHTML = res.resultdata
            }
            else if(res.status == "success") {
                clickclosepopup()
                Showmsg("success", "添加维度 " + dimensionname + " 成功")
                getdomains()
            }
        }
    })
}

function domain_clickcategoryofdimension() {
    const domaintreejson = JSON.parse(sessionStorage.getItem("domaintreejson"))
    const firstlevels = domaintreejson[0].children
    var hasdimension = false
    for (var i=0; i<firstlevels.length; i++) {
        if (firstlevels[i].label == "维度名") {
            hasdimension = true
            break
        }
    }
    if (!hasdimension) {
        Showmsg("error", "该领域下没有维度")
        return
    }
    const container = $("div#popup").empty()
    document.getElementById("popup").style.display = "flex"
    const adddomain = `
    <div id="popupcontainer-addcategory" class="borderradius-6 padding-25 bg-white flex-column" style="width: 700px;padding-left:30px;padding-bottom:10px">
        <!-- 标题和关闭按钮 -->
        <div class="width-100per flex-row align-center justify-between marginbottom-10">
            <span class="fontsize-20 fontweight-600">维度下添加知识分类</span>
            <div onclick="clickclosepopup()" class="cursor-pointer borderradius-6 padding-5 hover-bg-lightgrey flex-row align-center marginright-5"><img src="/static/global/images/close.png" class="img-22"></div>
        </div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-10 flex-row align-center">
            <div class="flex-column" style="width: calc(50% - 10px)">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    所属领域
                </div>
                <!-- 内容-输入框 -->
                <input id="popup-domain-addcategory-domainname" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);">
            </div>
            <div class="flex-column marginleft-20" style="width: calc(50% - 10px)">
                <!-- 标题 -->
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    选择维度名
                </div>
                <!-- 内容-输入框 -->
                <div class="width-100per" style="position: relative">
                    <input onclick="addcategory_showselect()" id="popup-domain-addcategory-dimensionname" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);" placeholder="选择维度">     
                    <div id="popup-domain-addcategory-dimensionselects" class="flex-column overflowy-auto border-lightgrey bg-white borderradius-6 padding-5" style="position: absolute; left: 0px; top: 43px; max-height: 160px; width: calc(100% - 4px);display: none">
                    </div>
                </div>   
            </div>
        </div>
        <!-- 分割 -->
        <div class="width-100per" style="height:10px;"></div>
        <!-- 标题 -->
        <div class="paddingtop-5 paddingbottom-10 flex-row align-center">
            <div class="flex-column" style="width: calc(50% - 10px)">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    选择知识分类添加位置
                </div>
                <!-- 内容-输入框 -->
                <div id="popup-domain-adddimension-dimensiontree" class="margintop-5 padding-10 borderradius-6 border-lightgrey overflow-auto" style="width: calc(100% - 5px);height:250px">
                    <div id="dimensiontree-choose" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;">
                        请选择维度
                    </div>
                    <div id="dimensiontree-loading" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;display:none">
                        <img src="/static/global/images/loading.gif" class="img-18">
                        <span class="fontsize-16 marginleft-10 fontweight-600" style="color: #1c86ee;">获取数据中</span>
                        </div>
                    <div id="dimensiontree-error" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;display:none">
                        <span class="fontsize-16 marginleft-10 fontweight-600" style="color: #d81e06;">[ERROR] 获取数据失败</span>
                    </div>
                    <div id="dimensiontree-content" class="width-100per height-100per flex-column fontsize-14" style="color: #4b4b4b;display:none">
                        
                    </div>
                </div>
            </div>
            <div class="flex-column marginleft-20" style="width: calc(50% - 10px);">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    上传知识分类文件
                </div>
                <!-- 内容-输入框 -->
                <div class="margintop-5 borderradius-6" style="width: calc(100% - 5px);height:250px">
                    <div class="color-grey fontsize-12">1 推荐以.json文件导入知识分类。每个分类必须包含四项字段：id、父分类id、元数据、其他属性。前两者用于确定分类间父子关系，根元素父分类id固定为-1，上传后会重新分配id；元数据必须包含三项字段：分类名称，分类描述和分类来源；其他键值对放在其他属性中。</div>
                    <div class="color-blue hover-text-underline cursor-pointer fontsize-12" style="margin-top:3px">JSON文件模板下载</div>

                    <div class="color-grey fontsize-12 margintop-10">2 也可上传只包含各分类名的.txt文件，行与行之间的分类名通过Tab符号数量，表示父子关系。</div>
                    <div class="color-blue hover-text-underline cursor-pointer fontsize-12" style="margin-top:3px">TXT文件模板下载</div>

                    <input type="file" id="popup-domain-addcategory-addfile" class="margintop-15 marginbottom-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 22px);" accept=".json, .txt">   
                    
                    <div class="margintop-10">知识分类将上传到<span id="addclass_chosenclassname" class="fontweight-600 marginleft-10 marginright-10">-</span>下</div>
                </div>
            </div>
        </div>
        <!-- 错误信息和提交按钮 -->
        <div class="width-100per margintop-15 flex-row align-center justify-between" style="height:39px;">
            <div id="popup-domain-addcategory-errmsg" class="color-red fontsize-14" style="margin-bottom:6px"></div>
            <div class="flex-row align-center">
                <img id="popup-domain-addcategory-loading" src="/static/global/images/loading.gif" class="hidden img-18 marginright-10">
                <button onclick="popup_submit_addclassofdimension()" type="button" class="layui-btn layui-btn-normal" style="width:70px;border-radius:6px;font-weight:600;height:28px;line-height:28px;">
                    保存
                </button>
            </div>
        </div> 
    </div>
    `
    $(adddomain).appendTo(container)
    document.getElementById("popup-domain-addcategory-domainname").value = document.getElementById("detail-domain-name").innerHTML
    document.getElementById("popup-domain-addcategory-domainname").readOnly = true
}

function addcategory_showselect() {
    const container = $("div#popup-domain-addcategory-dimensionselects").empty()
    document.getElementById("popup-domain-addcategory-dimensionselects").style.display = "flex"
    const firstlevels = JSON.parse(sessionStorage.getItem("domaintreejson"))[0].children
    var dimensions = firstlevels.filter(function(item) {
        return item.label == "维度名"
    })
    if (dimensions.length > 0) {
        for (var i = 0; i < dimensions.length; i++) {
            var dimension = dimensions[i]
            var dimensionname = dimension.name
            var dimensionid = dimension.id
            var dimensionselect = `
                <div onclick="addcategory_choosedimension('`+dimensionname+`', `+dimensionid.toString()+`)" class="cursor-pointer borderradius-6 width-100per hover-bg-lightgrey padding-10-7">
                    `+dimensionname+`
                </div>
            `
            $(dimensionselect).appendTo(container)
        }
    }
}

var addclasses_classid = -1
function addcategory_choosedimension(dimensionname, dimensionid) {
    document.getElementById("popup-domain-addcategory-dimensionname").value = dimensionname
    document.getElementById("popup-domain-addcategory-dimensionselects").style.display = "none"
    // 显示loading框 
    document.getElementById("dimensiontree-choose").style.display = "none"
    document.getElementById("dimensiontree-error").style.display = "none"
    document.getElementById("dimensiontree-content").style.display = "none"
    document.getElementById("dimensiontree-loading").style.display = "flex"


    // 将维度中的知识分类展示在左侧
    var formFile = new FormData()
    formFile.append("dimensionid", dimensionid)
    formFile.append("domainid", currentdomainid)
    var data = formFile;
    $.ajax({
        url: "/api/getclassesofdimension",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            if(res.status == "success"){
                const container = $("div#dimensiontree-content").empty()
                document.getElementById("dimensiontree-choose").style.display = "none"
                document.getElementById("dimensiontree-error").style.display = "none"
                document.getElementById("dimensiontree-loading").style.display = "none"
                document.getElementById("dimensiontree-content").style.display = "flex"
                res.resultdata[0].level = 0
                let queue = res.resultdata.slice()
                addclasses_classid = -1
                while (queue.length > 0) {
                    let item = queue.shift()
                    // 绘制
                    var classstr = `
                        <div id="addclass_class_`+item.id.toString()+`" onclick="dimensiontree_clickclass(`+item.id.toString()+`, '`+item.name+`')" class="padding-10-5 cursor-pointer hover-bg-lightgrey" style="margin-left: `+(item.level*24).toString()+`px">
                            `+ item.name +`
                        </div>
                    `
                    $(classstr).appendTo(container)
                    if (item.children && item.children.length > 0) {
                        for (var j=0; j<item.children.length; j++) {
                            item.children[item.children.length - 1 - j].level = item.level + 1
                            queue.unshift(item.children[item.children.length - 1 - j])
                        }
                    }
                }
                document.getElementById("dimensiontree-content").getElementsByTagName("div")[0].click()
            }
            else {
                document.getElementById("dimensiontree-choose").style.display = "none"
                document.getElementById("dimensiontree-loading").style.display = "none"
                document.getElementById("dimensiontree-content").style.display = "none"
                document.getElementById("dimensiontree-error").style.display = "flex"

            }
        }
    })
}

function dimensiontree_clickclass(id, classname) {
    if (addclasses_classid != -1) {
        document.getElementById("addclass_class_"+addclasses_classid.toString()).classList.remove("chosen-lightblue")
    }
    document.getElementById("addclass_class_"+id.toString()).classList.add("chosen-lightblue")
    addclasses_classid = id
    document.getElementById("addclass_chosenclassname").innerHTML = classname
}

function popup_submit_addclassofdimension() {
    const domainid = currentdomainid
    const dimensionname = document.getElementById("popup-domain-addcategory-dimensionname").value
    const clickedid = addclasses_classid
    const file = document.getElementById("popup-domain-addcategory-addfile").files[0]
    if (dimensionname == "") {
        document.getElementById("popup-domain-addcategory-errmsg").innerHTML = "请选择维度名"
        setTimeout(function(){
            document.getElementById("popup-domain-addcategory-errmsg").innerHTML = ""
        }, 1500);
        return
    }
    if (file == null || file.size == 0) {
        document.getElementById("popup-domain-addcategory-errmsg").innerHTML = "请上传分类文件"
        setTimeout(function(){
            document.getElementById("popup-domain-addcategory-errmsg").innerHTML = ""
        }, 1500);
        return
    }
    // 显示loading框
    document.getElementById("popup-domain-addcategory-loading").classList.remove("hidden")

    var formFile = new FormData()
    formFile.append("dimensionname", dimensionname)
    formFile.append("domainid", currentdomainid)
    formFile.append("clickedid", clickedid)
    formFile.append("file", file)
    var data = formFile;
    $.ajax({
        url: "/api/uploadclassestodimension",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            document.getElementById("popup-domain-addcategory-loading").classList.add("hidden")
            if(res.status == "success"){
                clickclosepopup()
                closeadd()
                GetDomainGraph()
                GetDomainTree()
                Showmsg("success", "添加分类文件成功！")
            }
            else {
                document.getElementById("popup-domain-addcategory-errmsg").innerHTML = res.resultdata
                setTimeout(function(){
                    document.getElementById("popup-domain-addcategory-errmsg").innerHTML = ""
                }, 1500);
            }
        }
    })
}

function domain_clickaddontologyofcategory() {
    const domainsanddimensions = JSON.parse(sessionStorage.getItem("domainsanddimensions"))
    var dimensions = domainsanddimensions.dimensions.filter(function(item) {
        return item.domain == document.getElementById("detail-domain-name").innerHTML
    })
    if (dimensions.length == 0) {
        Showmsg("error", "该领域下没有维度")
        return
    }
    const container = $("div#popup").empty()
    document.getElementById("popup").style.display = "flex"
    const adddomain = `
    <div id="popupcontainer-addcategory" class="borderradius-6 padding-25 bg-white flex-column" style="width: 700px;padding-left:30px;padding-bottom:10px">
        <!-- 标题和关闭按钮 -->
        <div class="width-100per flex-row align-center justify-between marginbottom-10">
            <span class="fontsize-20 fontweight-600">为知识分类创建本体</span>
            <div onclick="clickclosepopup()" class="cursor-pointer borderradius-6 padding-5 hover-bg-lightgrey flex-row align-center marginright-5"><img src="/static/global/images/close.png" class="img-22"></div>
        </div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-10 flex-row align-center">
            <div class="flex-column" style="width: calc(50% - 10px)">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    所属领域
                </div>
                <!-- 内容-输入框 -->
                <input id="popup-domain-addcategory-domainname" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);">
            </div>
            <div class="flex-column marginleft-20" style="width: calc(50% - 10px)">
                <!-- 标题 -->
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    选择维度名
                </div>
                <!-- 内容-输入框 -->
                <div class="width-100per" style="position: relative">
                    <input onclick="addcategory_showselect()" id="popup-domain-addcategory-dimensionname" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);" placeholder="选择维度">     
                    <div id="popup-domain-addcategory-dimensionselects" class="flex-column overflowy-auto border-lightgrey bg-white borderradius-6 padding-5" style="position: absolute; left: 0px; top: 43px; max-height: 160px; width: calc(100% - 4px);display: none">
                    </div>
                </div>   
            </div>
        </div>
        <!-- 分割 -->
        <div class="width-100per" style="height:10px;"></div>
        <!-- 标题 -->
        <div class="paddingtop-5 paddingbottom-10 flex-row align-center">
            <div class="flex-column" style="width: calc(50% - 10px)">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    选择添加本体的知识分类
                </div>
                <!-- 内容-输入框 -->
                <div id="popup-domain-adddimension-dimensiontree" class="margintop-5 padding-10 borderradius-6 border-lightgrey overflow-auto" style="width: calc(100% - 5px);height:250px">
                    <div id="dimensiontree-choose" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;">
                        请选择维度
                    </div>
                    <div id="dimensiontree-loading" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;display:none">
                        <img src="/static/global/images/loading.gif" class="img-18">
                        <span class="fontsize-16 marginleft-10 fontweight-600" style="color: #1c86ee;">获取数据中</span>
                        </div>
                    <div id="dimensiontree-error" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;display:none">
                        <span class="fontsize-16 marginleft-10 fontweight-600" style="color: #d81e06;">[ERROR] 获取数据失败</span>
                    </div>
                    <div id="dimensiontree-content" class="width-100per height-100per flex-column fontsize-14" style="color: #4b4b4b;display:none">
                        
                    </div>
                </div>
            </div>
            <div class="flex-column marginleft-20" style="width: calc(50% - 10px);">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    上传本体文件
                </div>
                <!-- 内容-输入框 -->
                <div class="margintop-5 borderradius-6" style="width: calc(100% - 5px);height:250px">
                    <div class="color-grey fontsize-12">我们只接受以.json文件格式导入分类本体，因为本体文件中必须包含各种字段。</div>
                    <div class="color-grey fontsize-12 margintop-5">必须包含<本体名称>字段和<本体类型>字段，其中<本体类型>字段只可选填"分类"或者"属性"，其次是<子分类>字段，其值为一个列表，包含其下的本体分类或本体属性。</div>
                    <div class="color-grey fontsize-12 margintop-5">若<本体类型>字段值为"属性"，则还需要包含<国标要求>字段，用于标识这个属性值的国标要求值。</div>
                    <div class="color-blue hover-text-underline cursor-pointer color-grey fontsize-12" style="margin-top:3px">JSON文件模板下载</div>

                    <input type="file" id="popup-domain-addcategory-addfile" class="margintop-15 marginbottom-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 22px);" accept=".json, .txt">   
                    
                    <div class="margintop-20">知识分类将上传到<span id="addclass_chosenclassname" class="fontweight-600 marginleft-10 marginright-10">-</span>下</div>
                </div>
            </div>
        </div>
        <!-- 错误信息和提交按钮 -->
        <div class="width-100per margintop-15 flex-row align-center justify-between" style="height:39px;">
            <div id="popup-domain-addcategory-errmsg" class="color-red fontsize-14" style="margin-bottom:6px"></div>
            <div class="flex-row align-center">
                <img id="popup-domain-addcategory-loading" src="/static/global/images/loading.gif" class="hidden img-18 marginright-10">
                <button onclick="popup_submit_addontologyofclass()" type="button" class="layui-btn layui-btn-normal" style="width:70px;border-radius:6px;font-weight:600;height:28px;line-height:28px;">
                    保存
                </button>
            </div>
        </div> 
    </div>
    `
    $(adddomain).appendTo(container)
    document.getElementById("popup-domain-addcategory-domainname").value = document.getElementById("detail-domain-name").innerHTML
    document.getElementById("popup-domain-addcategory-domainname").readOnly = true
}


function popup_submit_addontologyofclass() {
    const domainid = currentdomainid
    const dimensionname = document.getElementById("popup-domain-addcategory-dimensionname").value
    const clickedid = addclasses_classid
    const file = document.getElementById("popup-domain-addcategory-addfile").files[0]
    if (dimensionname == "") {
        document.getElementById("popup-domain-addcategory-errmsg").innerHTML = "请选择维度名"
        setTimeout(function(){
            document.getElementById("popup-domain-addcategory-errmsg").innerHTML = ""
        }, 1500);
        return
    }
    if (file == null || file.size == 0) {
        document.getElementById("popup-domain-addcategory-errmsg").innerHTML = "请上传本体文件"
        setTimeout(function(){
            document.getElementById("popup-domain-addcategory-errmsg").innerHTML = ""
        }, 1500);
        return
    }
    // 显示loading框
    document.getElementById("popup-domain-addcategory-loading").classList.remove("hidden")

    var formFile = new FormData()
    formFile.append("dimensionname", dimensionname)
    formFile.append("domainid", currentdomainid)
    formFile.append("clickedid", clickedid)
    formFile.append("file", file)
    var data = formFile;
    $.ajax({
        url: "/api/uploadontologytoclass",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            document.getElementById("popup-domain-addcategory-loading").classList.add("hidden")
            if(res.status == "success"){
                clickclosepopup()
                closeadd()
                GetDomainGraph()
                GetDomainTree()
                Showmsg("success", "添加本体文件成功！")
            }
            else {
                document.getElementById("popup-domain-addcategory-errmsg").innerHTML = res.resultdata
                setTimeout(function(){
                    document.getElementById("popup-domain-addcategory-errmsg").innerHTML = ""
                }, 1500);
            }
        }
    })
}