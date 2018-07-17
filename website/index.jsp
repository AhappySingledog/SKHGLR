<%@ page language="java" pageEncoding="UTF-8" %>
<% String serviceUrl = "" ;%>

<%!
    String getString(Object obj) {
        return  obj == null ? null : obj.toString();
    }

    String getStringDef(Object obj, String def) {
        return  obj == null ? def : obj.toString();
    }

    boolean isNullOrEmpty(String str) {
        return str == null || str.isEmpty();
    }

    boolean isEmpty(String str) {
        return str != null || str.equals("");
    }

    String call(String callback, String data) {
        return isNullOrEmpty(callback) ? data : String.format("%s(%s)", callback, data);
    }
%>

<%
    if(request.getParameter("exit") != null) {
        request.getSession().setAttribute("loginStr", null);//安全退出
        response.sendRedirect("index.jsp?t=" + System.currentTimeMillis());
    }
    boolean islogin = isNullOrEmpty(getString(request.getSession().getAttribute("loginStr")));
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="expires" content="0">
    <meta name="renderer" content="webkit">
    <title><%=getStringDef(request.getSession().getAttribute("token"), "系统登录")%></title>
    <link href="css/index.css" rel="stylesheet" />
    <%=islogin ? "": "<script src=\"js/core/require.js\" data-main=\"js/root\"></script>"%>
</head>
<body>
    <%= islogin ? "<iframe scrolling=\"auto\" frameborder=\"0\" allowtransparency=\"true\" src=\"./module/layout/html/login.html\"></iframe>" : ""%>
</body>
</html>