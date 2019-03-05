let http = require('http');
let url = require('url');
function createApplication(){
    // app是一个监听函数
    let app = (req, res) => {
        // 取出每一个layer
        // 1.获取请求的方法
        let m = req.method.toLowerCase();
        let {pathname} = url.parse(req.url, true);
        // 通过next方法进行迭代
        let index = 0;
        function next(err){
            if ( index === app.routes.length) return res.end(`Cannot ${m} ${pathname}`);
            let {method, path, handler} = app.routes[index++];//每次调用next就应该取下一个layer
            
            if (err) {
                // 如果有错误，我们应该去找错误中间件，错误中间件有一个特点，有四个参数
                if (handler.length === 4) {
                    handler(err,req, res, next);
                } else {
                    // 如果没有匹配到，需要把err继续传递下去
                    next(err);
                }
            } else {
                
                if(method === 'middle'){// 处理中间件
                    if (path === '/' || path === pathname || pathname.startsWith(path+'/')) {
                        handler(req, res, next);
                    } else {
                        // 如果中间件没有匹配到，则走下一个layer
                        next();
                    }
                } else {// 处理路由
                    if ((method === m || method === 'all') && (path === pathname || path === '*')) {
                       handler(req, res);
                    } else {
                        next();
                    }
                }
            }
        }
        next();//中间件的next方法
        // for (let i = 0; i<app.routes.length; i++) {
        //     let { method, path, handler } = app.routes[i];
        //     if ((method === m || method === 'all') && (path === pathname || path === '*')) {
        //         return handler(req, res);
        //     }
        // }
        
    }
    app.routes = [];
    app.use=function(path, handler){
        if (typeof handler !== 'function') {
            handler = path;
            path = '/';
        }
        let layer = {
            method: 'middle',// method是middle，表示是一个中间件
            path,
            handler
        };
        // 把中间件放到容器中
        app.routes.push(layer);
    }
    app.use(function (req, res, next) {
        let {pathname, query} = url.parse(req.url, true);
        let hostname = req.headers['host'].split(':')[0];
        req.path = pathname;
        req.query = query;
        req.hostname = hostname;
        next();
    });
    app.all = function (path, handler) {
        let layer = {
            method: 'all',
            path,
            handler
        };
        app.routes.push(layer);
    }
    http.METHODS.forEach(method => {
        method = method.toLocaleLowerCase();
        app[method] = function (path, handler) {
            let layer = {
                method,
                path,
                handler
            };
            app.routes.push(layer);
        }
    });
    // app.get = function (path, handler) {
    //     let layer = {
    //         method: 'get',
    //         path,
    //         handler
    //     };
    //     app.routes.push(layer);
    // }
    app.listen = function () {
        let server = http.createServer(app);
        server.listen(...arguments);
    }
    return app;
}
module.exports = createApplication;