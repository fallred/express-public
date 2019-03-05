// express数据
let express = require('./express');
// app监听函数
let app = express();
//RESTFUL API根据方法名的不同，做对应的处理
app.get('/name', function(req, res){
    // req代表请求，res代表响应
    res.end('zfpx');
});
app.get('/age', function(req, res){
    res.end('9');
});
app.post('/name', function(req, res){
    res.end('post name');
});
app.all('*', function (req, res) {
    res.end(req.method + 'user');
});
// 在3000端口上开启服务
app.listen(3000, function(){
    console.log(`server start on 3000`);
});

