//var http = require('http'),
//  //创建一个服务器
//server = http.createServer(function(req, res) {
//  res.writeHead(200, {
//      'Content-Type': 'text/plain'
//  });
//  res.write('hello world!');
//  res.end();
//});
////监听80端口
//server.listen(80);
//console.log('server started');

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
    var users = [];
app.use('/', express.static(__dirname + '/www'));
server.listen(80);

//socket部分
io.on('connection', function(socket) {
	//soctet表示当前连接到服务器的客户端
	console.log("server:client connect ");
    //接收并处理客户端发送的foo事件
    socket.on('foo', function(data) {
        //将消息输出到控制台
        console.log(data);
    });
    
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            console.log("loginsuccess");
            io.sockets.emit('system', nickname, users.length, "login");
        };
    });
    
    socket.on('disconnect', function() {
	    //将断开连接的用户从users中删除
	    users.splice(socket.userIndex, 1);
	    //通知除自己以外的所有人
	    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});
	
	//消息
	socket.on('postMsg', function(msg, color) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    
    //图片
    socket.on('img', function(imgData) {
    //通过一个newImg事件分发到除自己外的每个用户
	    socket.broadcast.emit('newImg', socket.nickname, imgData);
	});
});
console.log('server started on 80');