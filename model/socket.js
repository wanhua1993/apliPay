// 用于 与 前端 建立长链接
// 实现 客户端 与 服务端 的简单通讯

exports.get_socket = function (server) {
    const io = require('socket.io')(server);
    return io;
    // 建立连接
    // var users = [];
    // io.on('connection', function (socket) {

    //     console.log('你好 开始建立连接！');
    //     // 该 news 是客户端监听的事件，后面的对象是发送给客户端的消息体
    //     // 这里的监听事件 是监听客户端触发的事件，，回调函数中得到的是客户端发送过来的数据
    //     // socket.on('my other event', function (data) {
    //     //     for(var i = 0; i < users.length; i ++) {
    //     //         if(users[i].id == data.id) {
    //     //              users[i].socket = socket;
    //     //         } 
    //     //     }
    //     // });
    //     socket.on('getId', function (data) {
    //         users.push({
    //             id: data.id,
    //             socket: socket
    //         });
    //         // console.log(users);
    //     });
    //     socket.on('private', function (data) {
    //         var id = data.id;
    //         // console.log(data);
    //         users[0].socket.emit('news', data);
    //         // for(var i = 0; i < users[i].length; i ++) {
    //         //     if(users[i].id == id) {
    //         //         console.log(id);
    //         //         users[0].socket.emit('news', data);
    //         //     }
    //         // }
    //         // socket.broadcast.emit('news', data);
    //     })
    //     // 用户离线
    //     socket.on('disconnect', function () {

    //     });
    // });
}
