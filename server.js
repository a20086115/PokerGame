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
    
app.use('/', express.static(__dirname + '/www'));
server.listen(80);
Array.prototype.shuffle = function() {
    var array = this;
    var m = array.length,
        t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}
const siglePokes = ["A","2","3","4","5","6","7","8","9","10","J","Q","K",];
const pokes = [1,2,3,4,5,6,7,8,9,10,11,12,13,1,2,3,4,5,6,7,8,9,10,11,12,13,1,2,3,4,5,6,7,8,9,10,11,12,13,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
// pokes.shuffle()
var usersPokes = getUserPokes(3,4)

// 创建用户数组
var users = [];


var user = {
    name: "nickname",
    userIndex: 5,
    pokes:[]
}




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
        console.log("postMsg")
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    
    //图片
    socket.on('img', function(imgData) {
    //通过一个newImg事件分发到除自己外的每个用户
	    socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
    

    //打牌
	socket.on('postPoker', function(pokersArray, value) {
        // msg = [1,1,3]
        // value = 5;
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newPoker', socket.nickname, pokersArray, value);
    });

    // 监听开始游戏按钮
    socket.on('newGame', (pokesNum, personsNum) => {
        console.log(users.length)
        // if(personsNum != users.length){
        //     socket.broadcast.emit('error',"人数与当前连接人数不符合！");
        // }
        // 获取每个人的poke牌
        let userPokesArr = getUserPokes(personsNum, pokesNum);
        for(let i = 0; i < users.length; i++){
            users[i].pokes = userPokesArr[i];
        }
        socket.broadcast.emit("newg","s", users)
    })
});

console.log('server started on 80');


/**
* @author: YWQ
* @date: 2019-03-05
* @params:  useNUm: 人数， pokesNum: 扑克牌数量
* @return:  返回数组userPokers[]
* @description:  按照人数和扑克牌数量，将扑克牌平均分配。
*/
function getUserPokes(useNum, pokesNum){
    var userPokes = [];
    var totalPokes = [];
    // 获取总的扑克牌
    while(pokesNum){
        pokesNum--;
        totalPokes = totalPokes.concat(pokes);
    }
    totalPokes.shuffle() 
    // 遍历扑克牌
    totalPokes.forEach(function (val,index){
        if(userPokes[(index % useNum)]){
            userPokes[(index % useNum)].push(val)
        }else{
            userPokes[(index % useNum)] = [val]
        }
    })
    return userPokes
}

/**
* @author: YWQ
* @date: 2019-03-06
* @params: 牌数组
* @return: 排序后的数组
* @description: 使用插入排序，对扑克牌进行排序
*/
function insertionSort(arr) {
    var len = arr.length;
    var preIndex, current;
    for (var i = 1; i < len; i++) {
        preIndex = i - 1;
        current = arr[i];
        while(preIndex >= 0 && arr[preIndex] < current) {
            arr[preIndex+1] = arr[preIndex];
            preIndex--;
        }
        arr[preIndex+1] = current;
    }
    return arr;
}