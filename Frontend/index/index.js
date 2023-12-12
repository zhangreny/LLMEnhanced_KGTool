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
            }
            else if(res.status == "success") {
                document.getElementById("db-uri").innerHTML = res.resultdata.uri
                document.getElementById("db-icon-success").classList.remove("hidden")
                document.getElementById("db-icon-fail").classList.add("hidden")
                document.getElementById("db-icon-nodb").classList.add("hidden")
            }
        }
    })
}