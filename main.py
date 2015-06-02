import logging
from qq_login import SmartQQ

__author__ = 'chenwei'

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import os

import datetime

from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)

logger = logging.getLogger('demo')

count = 0;

## 模拟场景一：
from utils import config_file
import configparser

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        # print('get() ',self.request.headers)
        # self.write("Hello, world")
        # self.render('test.html')
        self.render('index2.html')

    def post(self, *args, **kwargs):
        print('post()',self.request)
        print('post() ',self.request.body);

class LoginHandler(tornado.web.RequestHandler):
    '''
    登录接口
    '''
    cf = configparser.ConfigParser()
    cf.read(config_file)
    qq = SmartQQ(
        username=cf.get('qq','username'),
        password=cf.get('qq','password')
    );

    def get(self):
        print('get()');
        # self.write('hello world'+str(datetime.datetime.now()))

        uri = self.request.uri;
        print('uri='+uri)

        if uri == '/check':
            tmp = self.qq.check_vc();
            msg = tornado.escape.json_decode(tmp)
            print(msg)
            self.write(msg)
        elif uri == '/getimage':
            msg = self.qq.get_captcha()
            msg = tornado.escape.json_decode(msg)
            self.write(msg)
        elif uri == '/encrypt':
            self.render('encrypt.html')
        else:
            print('不处理 ： match '+uri)

    def post(self):

        # print('LoginHandler post() ',self.request.body)
        uri = self.request.uri;
        print('uri='+uri)

        if(uri == "/login"):
            print('匹配　login')
            body = self.request.body;
            msg = tornado.escape.json_decode(body)
            print(msg);

            try:
                vcode = msg['vcode']
                if vcode:
                    self.qq.vcode = vcode
            except :
                print('msg[vcode] 解析失败')

            try:
                encrypt_pwd = msg['encrypt_pwd']
                if encrypt_pwd:
                    self.qq.encrypt_pwd = encrypt_pwd;
            except :
                print('msg[encrypt_pwd] 解析失败')

            self.qq.sign_in();

            print('finish')

        elif(uri == "/set_encrypt_pwd"):
            print('set encrypt_pwd=',self.request.body)
            body = self.request.body;
            msg = tornado.escape.json_decode(body)
            # print(msg)
            print(msg['encrypt_pwd'])
            pass

class TestAdd(tornado.web.RequestHandler):

    def get(self, *args, **kwargs):
        pass


class Application(tornado.web.Application):

    def __init__(self):

        settings = dict(
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            debug=True,
        );

        handlers = [
            (r"/", MainHandler),
            (r"/test", TestAdd),
            (r"/set_encrypt_pwd", LoginHandler),
            (r"/static/(.*)",tornado.web.StaticFileHandler,{'path':'html/static'}),
            (r"/check", LoginHandler),
            (r"/getimage", LoginHandler),
            (r"/login", LoginHandler),
            (r"/encrypt", LoginHandler),
        ]

        tornado.web.Application.__init__(self,handlers,**settings)

        LOGDIR = os.path.join(os.getcwd(),'log')
        LOGFILE = datetime.datetime.now().strftime('%Y-%m-%d')+'.log'
        logging.basicConfig(level=logging.DEBUG,
                            format='',
                            datefmt='%a, %d %b %Y',
                            filename = os.path.join(LOGDIR,LOGFILE),
                            filemode='a'
                            )

        fileLog = logging.FileHandler(os.path.join(LOGDIR,LOGFILE),'w')
        formatter = logging.Formatter('%(asctime)s %(name)s:%(levelname)s %(message)s')
        fileLog.setFormatter(formatter)

        logger.addHandler(fileLog)
        logger.setLevel(logging.DEBUG)

def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()