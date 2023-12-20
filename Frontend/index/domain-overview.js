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
                drawtuli(res.resultdata.nodes)
                drawgraphfromjson(res.resultdata)
            }
        }
    })
}

// 根据节点绘制图例
function drawtuli(nodes) {
    const container = $("div#domain-graph-tuli").empty() // 清除图例
    $('<div>图例</div><div id="domain-graph-tuli-container"></div>').appendTo(container)
    var alllabels = []
    for(var i=0; i<nodes.length; i++) {
        if(alllabels.indexOf(nodes[i].label) == -1) {
            alllabels.push(nodes[i].label);
        }
    }
    var colors = d3.scaleOrdinal().domain(d3.range(alllabels.length)).range(d3.schemeCategory10)
    Array.from(alllabels).forEach(function (record, index) {
        $('<div class="flex-row align-center paddingtop-5"><div class="marginright-5" style="width:10px;height:10px;border-radius:5px;background-color:'+colors(index)+';margin-top:1px;"></div><div class="fontsize-12">'+record+'</div></div>').appendTo(container);
    })
}

function drawgraphfromjson(nodesandlinks) {
    const nodes = nodesandlinks.nodes
    const links = nodesandlinks.links

}