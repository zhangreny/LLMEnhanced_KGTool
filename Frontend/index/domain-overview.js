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
var currentnodeid = -1
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
                var container = $("div#domain-tree").empty()
                sessionStorage.setItem("domaintreejson", JSON.stringify(res.resultdata))
                res.resultdata[0].level = 0
                let queue = res.resultdata.slice()
                addclasses_classid = -1
                const fatherids = []
                while (queue.length > 0) {
                    let item = queue.shift()
                    // 找到根节点
                    if (item.level == 0) {
                        container = document.getElementById("domain-tree")
                    } else {
                        container = document.getElementById("domain_tree_"+fatherids[item.level-1].toString())
                    }
                    // 添加小三角
                    if (container.getElementsByTagName("img").length == 0) {
                        $(`
                            <img src="/static/global/images/right.png" class="img-10 transform-90 marginright-5">
                        `).prependTo(container.getElementsByTagName("span")[0])
                    }
                    // 绘制
                    var classstr = `
                        <div id="domain_tree_`+item.id.toString()+`" class="flex-column" style="margin-left: 20px">
                            <div onclick="domaintree_click(`+item.id.toString()+`, '`+item.name+`')" class="flex-row align-items borderradius-6 padding-10-5 hover-bg-darkyellow cursor-pointer" style="line-height:16px">
                                <span onclick="ExpandandCollpaseSubclass(event, `+item.id.toString()+`)" class="flex-row align-center justify-center" style="width:15px">
                                </span>`+ item.name +`
                            </div>
                        </div>
                    `
                    $(classstr).appendTo(container)
                    if (item.children && item.children.length > 0) {
                        for (var j=0; j<item.children.length; j++) {
                            item.children[item.children.length - 1 - j].level = item.level + 1
                            queue.unshift(item.children[item.children.length - 1 - j])
                        }
                    }
                    if (item.level >= fatherids.length) {
                        fatherids.push(item.id)
                    } else {
                        fatherids[item.level] = item.id
                    }
                }
                domaintree_click(res.resultdata[0].id, res.resultdata[0].name)
            }
        }
    })
}

function ExpandandCollpaseSubclass(event, id) {
    event.stopPropagation()
    const container = document.getElementById("domain_tree_"+id.toString())
    const img = container.firstElementChild.getElementsByTagName("img")[0]
    if (img.classList.contains("transform-90")) {
        img.classList.remove("transform-90")
        const sons = container.querySelectorAll(":scope > div")
        for (var j=1; j<sons.length; j++){
            sons[j].style.display = "none"
        }
    }
    else {
        img.classList.add("transform-90")
        const sons = container.querySelectorAll(":scope > div")
        for (var j=1; j<sons.length; j++){
            sons[j].style.display = "flex"
        }
    }
}

function domaintree_click(id, name) {
    if (currentnodeid != -1) {
        document.getElementById("domain_tree_"+currentnodeid.toString()).firstElementChild.classList.remove("chosen-darkgreen")
        document.getElementById("domain_tree_"+currentnodeid.toString()).firstElementChild.classList.add("hover-bg-darkyellow")
        const imgs = document.getElementById("domain_tree_"+currentnodeid.toString()).firstElementChild.getElementsByTagName("img")
        if (imgs.length > 0) {
            imgs[0].src = "/static/global/images/right.png"
        }
    }
    document.getElementById("domain_tree_"+id.toString()).firstElementChild.classList.remove("hover-bg-darkyellow")
    document.getElementById("domain_tree_"+id.toString()).firstElementChild.classList.add("chosen-darkgreen")
    const imgs = document.getElementById("domain_tree_"+id.toString()).firstElementChild.getElementsByTagName("img")
    if (imgs.length > 0) {
        imgs[0].src = "/static/global/images/right-white.png"
    }
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

function hexToRgba(hex, opacity) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
  
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else {
      throw new Error('Invalid hexadecimal color format');
    }
  }
function drawgraphfromjson(divid, nodesandlinks) {
    const noderadiuses = [60,48,36,24,12]
    const linkswidth = [10,8,6,4,2]
    const linktextcolor = ["#686868","#787878","#888888","#989898","#a8a8a8"]
    const testymove = [60,48,36,24,12]
    const textsizes = [24,20,16,12,8]
    const relatextsizes = [12,10,8,6,4]
    const relatextdy = [-4,-3,-2,-1,0]
    
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
    simulation.force("collide", d3.forceCollide().radius(82))
    simulation.tick(25)

    // 边长
    const link = g.append("g").selectAll(".domain-link")
        .data(links)
        .enter()
        .append("path")
        .style("stroke", function (d) {
            return hexToRgba(colors(alllabels.indexOf(d.source.label)), 0.25)
        })
        .style("stroke-width", function (d) {
            return linkswidth[d.level].toString() + "px"
        })
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
        .style("font-size", function(d) {
            return relatextsizes[d.level].toString() + "px"
        })
        .attr("dy", function(d) {
            return relatextdy[d.level]
        })
        .style("fill", function (d) {
            return linktextcolor[d.level]
        })
    
    // 节点
    const node = g.append("g").selectAll(".domain-node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "domain-node")
        .attr("r", function (d) {
            return noderadiuses[d.level]
        })
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
        relanametest.attr("startOffset", function (d) {
            if (d.source.x < d.target.x) {
                return "calc(50% + 6px)"
            }
            else {
                return "calc(50% - 6px)"
            }
        })
        /*
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
        */
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
        .attr("x", -80)
        .attr("y", function(d) {
            return testymove[d.level]
        })
        .attr("width", 160)
        .attr("height", 30)
        .append("xhtml:div")
        .attr("class", "flex-row align-center justify-center color-darkgrey fontweight-600")
        .style("width", "100%")
        .style("height", "100%")
        .style("line-height", "100%")
        .style("font-size", function(d) {
            return textsizes[d.level].toString() + "px"
        })
        .style("padding", "3px")
        .style("overflow-wrap", "break-word")
        .style("word-break", "break-all")
        .style("text-align", "center")
        .style("overflow", "hidden")
        .style("text-overflow", "ellipsis")
        .style("white-space", "nowrap")
        .style("display", "inline-block")
        .text(function (d) {
            return d.name
        })
}
