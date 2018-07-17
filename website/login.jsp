<%@ page language="java" import="java.net.*,java.io.*" pageEncoding="UTF-8" %>
<% String serviceUrl = "http://172.28.1.101:8089/ServiceEngine/rest/services/OmsServer/login" ;%>

<%!
    String getString(Object obj) {
        return  obj == null ? null : obj.toString();
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

    boolean isVail(String json) throws Exception{
        return json.indexOf("\"isSuccess\":true,") > 0;
    }

    String getLogin(String serviceUrl,String username, String password, String sys) throws Exception{
        URL url = new URL(serviceUrl + "?_type=json&username=" + username + "&password=" + password + "&sys=" + sys);
        HttpURLConnection connect = (HttpURLConnection)url.openConnection();
        connect.setRequestProperty("content-type", "text/plain; charset=utf-8");
        if (connect.getResponseCode() != 200) throw new IOException(connect.getResponseMessage());
        BufferedReader brd = new BufferedReader(new InputStreamReader(connect.getInputStream(), "utf-8"));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = brd.readLine()) != null) sb.append(line);
        brd.close();
        connect.disconnect();
        return new String(sb.toString());
    }
%>

<%
    String token = request.getParameter("token");
    String callback = request.getParameter("callback");
    if(!isNullOrEmpty(token)) {//获取用户属性
        if(getString(request.getSession().getAttribute("token")).equals(token)) {
            request.getSession().setAttribute("token", java.util.UUID.randomUUID().toString().substring(4,28));
            response.getWriter().write(call(callback, getString(request.getSession().getAttribute("loginStr"))));
        }
    }else {
        String sys = request.getParameter("sys");
        if(!isNullOrEmpty(sys)) {//登录
            String un = request.getParameter("un");
            String pw = request.getParameter("pw");
            String msg = getLogin(serviceUrl, un, pw, sys);
            if(isVail(msg))
            {
                request.getSession().setAttribute("token", java.util.UUID.randomUUID().toString().substring(4,28));
                request.getSession().setAttribute("loginStr", msg);
                response.getWriter().write("<script>top.location.href ='" + request.getRequestURI().replace("login","index") + "?_t="+ System.currentTimeMillis() + "'</script>");
            }
            else{
                response.getWriter().write("<script>alert('用户不存在于本系统，请联系管理员')</script>");
            }
        }
    }
%>