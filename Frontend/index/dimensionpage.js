function changedimensionpage(index) {
    // 内容页切换
    const pages = document.querySelectorAll('#main-right-box-dimension [id^="domain-page-"]')
    for (var i=0; i<pages.length; i++) {
        pages[i].style.display = "none"
    }
    pages[index].style.display = "flex"
    // 选项卡样式的切换
    const tabs = document.querySelectorAll('#main-right-box-dimension [name="dimensionfuncs"]')
    for (var i=0; i<tabs.length; i++) {
        tabs[i].classList.add("hover-bg-darkyellow")
        tabs[i].classList.remove("chosen-lightblue")

    }
    tabs[index].classList.remove("hover-bg-darkyellow")
    tabs[index].classList.add("chosen-lightblue")
    // 根据不同的选项卡去获取不同的数据
    if (index == 0) {}
    else if (index == 1){getclassesofdimension()}
    else if (index == 2){getmaterialsofdimension()}
}

// 获取维度下分类
function getclassesofdimension() {
    var formFile = new FormData()
    formFile.append("domainid", currentdomainid)
    formFile.append("dimensionid", currentdimensionid)
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
            if(res.status == "fail") {
                
            }
            else if(res.status == "success") {
                const classes = $("div#classes-explorer").empty();
                $('<div id="classes-explorer-content"></div>').appendTo(classes);
                var tree = layui.tree;
                tree.render({
                    elem: '#classes-explorer-content',
                    data: res.resultdata,
                    showLine: false
                });
                // 设置右键功能菜单，最高是根据containerid区域覆写，因为多个领域都需要覆写
                // overwriterightclick('layui-tree-entry')
            }
        }
    })
}

