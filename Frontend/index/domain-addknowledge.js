
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
    document.getElementById("popup-domain-adddimension-loading").classList.remove("hidden")
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
                document.getElementById("popup-domain-adddimension-loading").classList.add("hidden")
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
        <!-- 分割 -->
        <div class="width-100per" style="height:10px;"></div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-5 flex-row align-center fontweight-600" style="">
            维度素材元数据键
        </div>
        <div class="color-grey fontsize-12">用于规定此维度素材的元数据键，每行输入一个。</div>
        <!-- 内容-输入框 -->
        <textarea id="popup-domain-adddimension-metakeys" class="margintop-10 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);height:100px;resize:none"></textarea>
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
    const metakeys = document.getElementById("popup-domain-adddimension-metakeys").value
    if (dimensionname == "") {
        document.getElementById("popup-domain-adddimension-errmsg").innerHTML = "请输入维度名"
        return
    } 
    if (metakeys == "") {
        document.getElementById("popup-domain-adddimension-errmsg").innerHTML = "请输入维度素材元数据键"
        return
    } 
    // 显示loading框
    document.getElementById("popup-domain-adddimension-loading").classList.remove("hidden")
    var formFile = new FormData()
    formFile.append("id", domainid)
    formFile.append("newdimension", dimensionname)
    formFile.append("description", description)
    formFile.append("metakeys", metakeys)
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
                document.getElementById("popup-domain-adddimension-loading").classList.add("hidden")
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
    <div id="popupcontainer-addcategory" class="borderradius-6 padding-25 bg-white flex-column" style="width: 820px;padding-left:30px;padding-bottom:10px">
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
                <div id="popup-domain-adddimension-dimensiontree" class="margintop-5 padding-5 borderradius-6 border-lightgrey overflow-auto" style="width: calc(100% - 5px);height:250px">
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
                    <div id="dimensiontree-content" class="height-100per flex-column fontsize-14" style="color: #4b4b4b;display:none; width:calc(100% + 20px); margin-left:-20px">
                        
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
                    <div onclick="DownloadJSONtemplate_addcategory()" class="color-blue hover-text-underline cursor-pointer fontsize-12" style="margin-top:3px">JSON文件模板及构建教程下载</div>

                    <div class="color-grey fontsize-12 margintop-10">2 也可上传只包含各分类名的.txt文件，行与行之间的分类名通过Tab符号数量，表示父子关系。</div>
                    <div onclick="DownloadTXTtemplate_addcategory()" class="color-blue hover-text-underline cursor-pointer fontsize-12" style="margin-top:3px">TXT文件模板下载</div>

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
                var container = $("div#dimensiontree-content").empty()
                document.getElementById("dimensiontree-choose").style.display = "none"
                document.getElementById("dimensiontree-error").style.display = "none"
                document.getElementById("dimensiontree-loading").style.display = "none"
                document.getElementById("dimensiontree-content").style.display = "flex"
                res.resultdata[0].level = 0
                let queue = res.resultdata.slice()
                addclasses_classid = -1
                const fatherids = []
                while (queue.length > 0) {
                    let item = queue.shift()
                    // 找到根节点
                    if (item.level == 0) {
                        container = document.getElementById("dimensiontree-content")
                    } else {
                        container = document.getElementById("addclass_class_"+fatherids[item.level-1].toString())
                    }
                    // 添加小三角
                    if (container.getElementsByTagName("img").length == 0) {
                        $(`
                            <img src="/static/global/images/right.png" class="img-8 transform-90 marginright-5">
                        `).prependTo(container.getElementsByTagName("span")[0])
                    }
                    // 绘制
                    var classstr = `
                        <div id="addclass_class_`+item.id.toString()+`" class="flex-column" style="margin-left: 20px">
                            <div onclick="dimensiontree_clickclass(`+item.id.toString()+`, '`+item.name+`')" class="flex-row align-center padding-10-5 cursor-pointer hover-bg-lightgrey" style="line-height:16px">
                                <span onclick="ExpandandCollpaseSubclass_addcategory(event, `+item.id.toString()+`)" class="flex-row align-center justify-center" style="width:15px">
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
                document.getElementById("dimensiontree-content").firstElementChild.querySelectorAll(":scope > div")[0].click()
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

function ExpandandCollpaseSubclass_addcategory(event, id) {
    event.stopPropagation()
    const container = document.getElementById("addclass_class_"+id.toString())
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

function dimensiontree_clickclass(id, classname) {
    if (addclasses_classid != -1) {
        document.getElementById("addclass_class_"+addclasses_classid.toString()).firstElementChild.classList.remove("chosen-lightblue")
        document.getElementById("addclass_class_"+addclasses_classid.toString()).firstElementChild.classList.add("hover-bg-lightgrey")
    }
    document.getElementById("addclass_class_"+id.toString()).firstElementChild.classList.remove("hover-bg-lightgrey")
    document.getElementById("addclass_class_"+id.toString()).firstElementChild.classList.add("chosen-lightblue")
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

function DownloadJSONtemplate_addcategory() {
    window.open('/template_download/add_category_to_dimension/json', '_blank');
}

function DownloadTXTtemplate_addcategory() {
    window.open('/template_download/add_category_to_dimension/txt', '_blank');
}

function domain_clickaddontologyofcategory() {
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
    <div id="popupcontainer-addcategory" class="borderradius-6 padding-25 bg-white flex-column" style="width: 820px;padding-left:30px;padding-bottom:10px">
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
                <div id="popup-domain-adddimension-dimensiontree" class="margintop-5 padding-5 borderradius-6 border-lightgrey overflow-auto" style="width: calc(100% - 5px);height:250px">
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
                    <div id="dimensiontree-content" class="height-100per flex-column fontsize-14" style="color: #4b4b4b;display:none;margin-left:-20px;width: calc(100% + 20px)">
                        
                    </div>
                </div>
            </div>
            <div class="flex-column marginleft-20" style="width: calc(50% - 10px);">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    上传本体文件
                </div>
                <!-- 内容-输入框 -->
                <div class="margintop-5 borderradius-6" style="width: calc(100% - 5px);height:250px">
                    <div class="color-grey fontsize-12">推荐以.json文件导入某分类的本体。每个本体必须包含四项字段：id、父本体id、本体类型、本体属性。前两者用于确定分类间父子关系，根元素父本体id固定为-1；本体类型必须是以下二选一：本体分类/本体属性。</div><div class="margintop-5 color-grey fontsize-12">若类型为本体分类，则本体属性字段除必须包含本体分类名外，可自行添加键值对。若类型为本体属性，则本体属性字段至少包含如下三项：本体属性名，属性值要求，属性值要求来源。</span></div>
                    <div onclick="DownloadJSONtemplate_addontology()" class="color-blue hover-text-underline cursor-pointer color-grey fontsize-12" style="margin-top:3px">JSON文件模板及构建教程下载</div>

                    <input type="file" id="popup-domain-addcategory-addfile" class="margintop-15 marginbottom-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 22px);" accept=".json, .txt">   
                    
                    <div class="margintop-10">本体将上传到<span id="addclass_chosenclassname" class="fontweight-600 marginleft-10 marginright-10">-</span>下</div>
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

function DownloadJSONtemplate_addontology() {
    window.open('/template_download/add_ontology_to_category/json', '_blank');
}

function domain_clickaddmaterialaccordingtoontology() {
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
    <div id="popupcontainer-addcategory" class="borderradius-6 padding-25 bg-white flex-column" style="width: 900px;padding-left:30px;padding-bottom:10px">
        <!-- 标题和关闭按钮 -->
        <div class="width-100per flex-row align-center justify-between marginbottom-10">
            <span class="fontsize-20 fontweight-600">根据本体添加知识素材</span>
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
                    <input onclick="addmaterial_showselect()" id="popup-domain-addcategory-dimensionname" class="margintop-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 25px);" placeholder="选择维度">     
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
                    选择知识分类
                </div>
                <!-- 内容-输入框 -->
                <div id="popup-domain-adddimension-dimensiontree" class="margintop-5 padding-5 borderradius-6 border-lightgrey overflow-auto" style="width: calc(100% - 5px);height:250px">
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
                    <div id="dimensiontree-content" class="width-100per height-100per flex-column fontsize-14" style="color: #4b4b4b;display:none;margin-left:-20px;width:calc(100% + 20px)">
                        
                    </div>
                </div>
            </div>
            <div class="marginleft-20 flex-column" style="width: calc(50% - 10px)">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    知识分类本体展示
                </div>
                <!-- 内容-输入框 -->
                <div id="popup-domain-addmaterial-ontologytree" class="margintop-5 padding-5 borderradius-6 border-lightgrey overflow-auto" style="width: calc(100% - 5px);height:250px">
                    <div id="ontologytree-choose" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;">
                        请选择知识分类
                    </div>
                    <div id="ontologytree-loading" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;display:none">
                        <img src="/static/global/images/loading.gif" class="img-18">
                        <span class="fontsize-16 marginleft-10 fontweight-600" style="color: #1c86ee;">获取数据中</span>
                        </div>
                    <div id="ontologytree-error" class="width-100per height-100per flex-row justify-center align-center fontsize-16 fontweight-600" style="color: #4b4b4b;display:none">
                        <span class="fontsize-16 marginleft-10 fontweight-600" style="color: #d81e06;">[ERROR] 获取数据失败</span>
                    </div>
                    <div id="ontologytree-content" class="height-100per flex-column fontsize-12" style="color: #4b4b4b;display:none;margin-left:-20px;width:calc(100% + 20px)">
                        
                    </div>
                </div>
            </div>
        </div>
        <!-- 标题 -->
        <div class="paddingtop-10 paddingbottom-10 flex-row align-center">
            <div class="flex-column" style="width: calc(50% - 10px);">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    下载素材填写表格
                </div>
                <!-- 内容-输入框 -->
                <div class="margintop-5 borderradius-6 paddingbottom-5" style="width: calc(100% - 5px);height:80px">
                    <div class="color-grey fontsize-12">为了用户导入数据的方便，我们将本体文件中本体属性作为表格第一行导出为xls文件，并在表格第二行给出这些本体属性的要求值。从第三行开始，你可对应表头填写对应素材数据的属性值。</div>
                    <div onclick="DownloadXLStutorial_addmaterial()" class="color-blue hover-text-underline cursor-pointer color-grey fontsize-12" style="margin-top:7px">表格填写教程下载</div>
                    <div id="download_ontology" onclick="DownloadXLStemplate_addmaterial()" class="color-blue hover-text-underline cursor-pointer color-grey fontsize-12" style="margin-top:7px;display:none">素材填写表格文件下载</div>
                    <div id="download_noontology" class="color-red fontsize-12" style="margin-top:7px">请给分类添加本体后下载填写表格</div>
                </div>
            </div>
            <div class="flex-column marginleft-20" style="width: calc(50% - 10px);">
                <div class="paddingtop-10 paddingbottom-10 flex-row align-center fontweight-600" style="">
                    上传素材填写表格文件
                </div>
                <!-- 内容-输入框 -->
                <div class="margintop-5 borderradius-6 paddingbottom-5" style="width: calc(100% - 5px);height:80px">

                    <input type="file" id="popup-domain-addcategory-addfile" class="margintop-5 marginbottom-5 padding-10 borderradius-6 border-lightgrey" style="width: calc(100% - 22px);" accept=".xls, .xlsx, .csv">   
                    
                    <div class="margintop-10">素材数据将上传到<span id="addclass_chosenclassname" class="fontweight-600 marginleft-10 marginright-10">-</span>下</div>
                </div>
            </div>
        </div>
        <!-- 分割 -->
        <div class="width-100per" style="height:10px;"></div>
        <!-- 错误信息和提交按钮 -->
        <div class="width-100per margintop-15 flex-row align-center justify-between" style="height:39px;">
            <div id="popup-domain-addcategory-errmsg" class="color-red fontsize-14" style="margin-bottom:6px"></div>
            <div class="flex-row align-center">
                <img id="popup-domain-addcategory-loading" src="/static/global/images/loading.gif" class="hidden img-18 marginright-10">
                <button onclick="popup_submit_addmaterialtocategory()" type="button" class="layui-btn layui-btn-normal" style="width:70px;border-radius:6px;font-weight:600;height:28px;line-height:28px;">
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

function addmaterial_showselect() {
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
                <div onclick="addmaterial_choosedimension('`+dimensionname+`', `+dimensionid.toString()+`)" class="cursor-pointer borderradius-6 width-100per hover-bg-lightgrey padding-10-7">
                    `+dimensionname+`
                </div>
            `
            $(dimensionselect).appendTo(container)
        }
    }
}

function addmaterial_choosedimension(dimensionname, dimensionid) {
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
                var container = $("div#dimensiontree-content").empty()
                document.getElementById("dimensiontree-choose").style.display = "none"
                document.getElementById("dimensiontree-error").style.display = "none"
                document.getElementById("dimensiontree-loading").style.display = "none"
                document.getElementById("dimensiontree-content").style.display = "flex"
                res.resultdata[0].level = 0
                let queue = res.resultdata.slice()
                addclasses_classid = -1
                const fatherids = []
                while (queue.length > 0) {
                    let item = queue.shift()
                    // 找到根节点
                    if (item.level == 0) {
                        container = document.getElementById("dimensiontree-content")
                    } else {
                        container = document.getElementById("addclass_class_"+fatherids[item.level-1].toString())
                    }
                    // 添加小三角
                    if (container.getElementsByTagName("img").length == 0) {
                        $(`
                            <img src="/static/global/images/right.png" class="img-8 transform-90 marginright-5">
                        `).prependTo(container.getElementsByTagName("span")[0])
                    }
                    // 绘制
                    var classstr = `
                        <div id="addclass_class_`+item.id.toString()+`" class="flex-column" style="margin-left: 20px">
                            <div onclick="classtree_clickclass(`+item.id.toString()+`, '`+item.name+`')" class="flex-row align-center padding-10-5 cursor-pointer hover-bg-lightgrey" style="line-height:16px">
                                <span onclick="ExpandandCollpaseSubclass_addcategory(event, `+item.id.toString()+`)" class="flex-row align-center justify-center" style="width:15px">
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
                document.getElementById("dimensiontree-content").firstElementChild.querySelectorAll(":scope > div")[0].click()
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

function classtree_clickclass(id, classname) {
    if (addclasses_classid != -1) {
        document.getElementById("addclass_class_"+addclasses_classid.toString()).firstElementChild.classList.remove("chosen-lightblue")
        document.getElementById("addclass_class_"+addclasses_classid.toString()).firstElementChild.classList.add("hover-bg-lightgrey")
    }
    document.getElementById("addclass_class_"+id.toString()).firstElementChild.classList.remove("hover-bg-lightgrey")
    document.getElementById("addclass_class_"+id.toString()).firstElementChild.classList.add("chosen-lightblue")
    addclasses_classid = id
    document.getElementById("addclass_chosenclassname").innerHTML = classname

    // 显示loading框 
    document.getElementById("ontologytree-choose").style.display = "none"
    document.getElementById("ontologytree-error").style.display = "none"
    document.getElementById("ontologytree-content").style.display = "none"
    document.getElementById("ontologytree-loading").style.display = "flex"

    // 将分类下的本体展示在本体侧
    var formFile = new FormData()
    formFile.append("categoryid", id)
    var data = formFile;
    $.ajax({
        url: "/api/getontologiesofcategory",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            if(res.status == "success"){
                var container = $("div#ontologytree-content").empty()
                document.getElementById("ontologytree-choose").style.display = "none"
                document.getElementById("ontologytree-error").style.display = "none"
                document.getElementById("ontologytree-loading").style.display = "none"
                document.getElementById("ontologytree-content").style.display = "flex"
                if (res.resultdata.length == 0) {
                    var classstr = `
                        <div class="width-100per height-100per flex-column align-center justify-center fontsize-16 fontweight-600" style="color: #4b4b4b;">
                            暂无本体
                            <div class="color-blue hover-text-underline cursor-pointer fontsize-14 margintop-15" onclick="skiptoaddontology()">添加本体</div>
                        </div>
                    `
                    $(classstr).appendTo(container)
                    document.getElementById("download_ontology").style.display = "none"
                    document.getElementById("download_noontology").style.display = "flex"
                }
                else {
                    document.getElementById("download_noontology").style.display = "none"
                    document.getElementById("download_ontology").style.display = "flex"
                    for (var i=0; i<res.resultdata.length; i++) {
                        res.resultdata[i].level = 0
                    }
                    let queue = res.resultdata.slice()
                    const fatherids = []
                    while (queue.length > 0) {
                        let item = queue.shift()
                        // 找到根节点
                        if (item.level == 0) {
                            container = document.getElementById("ontologytree-content")
                        } else {
                            container = document.getElementById("addmaterial_ontology_"+fatherids[item.level-1].toString())
                        }
                        // 添加小三角
                        if (container.getElementsByTagName("img").length == 0) {
                            $(`
                                <img src="/static/global/images/right.png" class="img-6 transform-90 marginright-5">
                            `).prependTo(container.getElementsByTagName("span")[0])
                        }
                        // 绘制
                        var classstr = `
                            <div id="addmaterial_ontology_`+item.id.toString()+`" class="flex-column" style="margin-left: 20px">
                                <div class="flex-row align-center padding-10-3 hover-bg-lightgrey" style="line-height:14px">
                                    <span onclick="ExpandandCollpaseSubclass_addmaterial(event, `+item.id.toString()+`)" class="flex-row align-center justify-center cursor-pointer" style="width:12px;">
                                    </span><span style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:800px">`+ item.name +`</span>
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
                }
            }
            else {
                document.getElementById("ontologytree-choose").style.display = "none"
                document.getElementById("ontologytree-loading").style.display = "none"
                document.getElementById("ontologytree-content").style.display = "none"
                document.getElementById("ontologytree-error").style.display = "flex"
            }
        }
    })
}

function ExpandandCollpaseSubclass_addmaterial(event, id){
    event.stopPropagation()
    const container = document.getElementById("addmaterial_ontology_"+id.toString())
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

function skiptoaddontology() {
    clickclosepopup()
    closeadd()
    setTimeout(function() {
        domain_clickaddontologyofcategory()
    }, 100);
}

function DownloadXLStemplate_addmaterial() {
    window.open('/template_download/add_material_to_category/xls?categoryid='+addclasses_classid.toString(), '_blank');
}

function DownloadXLStutorial_addmaterial() {
    window.open('/template_download/add_material_to_category/tutorial', '_blank');
}