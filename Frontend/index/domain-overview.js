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
    simulation.force("charge", d3.forceManyBody().strength(20))
    simulation.force("center", d3.forceCenter(width / 2, height / 2))
    simulation.force("x", d3.forceX().strength(0.1))
    simulation.force("y", d3.forceY().strength(0.25))
    simulation.alphaDecay(0.2)
    simulation.force("collide", d3.forceCollide().radius(72))
    simulation.tick(15)

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