/**
 * Created by chenwei on 15-6-1.
 */

/**
 * 是否需要验证码
 * @type {boolean}
 */
var isNeedVerifyCode = false;
var TYPE_GET='get'
var TYPE_POST='post'
var DATATYPE_JSON='json'

var ischeck = false;


$(document).ready(function(){
    $('#bt_check').click(function(){
        check_vc();
    });

    $('#bt_smscode').click(function(){
        get_captcha()
    });

    $('#bt_login').click(function(){
        get_captcha()
    });
})

/**
 * get 请求服务器
 * @param url
 * @param data
 * @param success_callback
 */
function req_get(url,data,success_callback){
    req(url,TYPE_GET,data,DATATYPE_JSON,success_callback,null);
}

/**
 * post 请求服务器
 * @param url
 * @param data
 * @param success_callback
 */
function req_post(url,data,success_callback){
    req(url,TYPE_POST,data,DATATYPE_JSON,success_callback,null);
}

/**
 * 请求服务器　（提取共有方法）
 * @param url
 * @param type
 * @param data
 * @param dataType
 * @param success_callback
 * @param error_calllback
 */
function req(url,type,data,dataType,success_callback,error_calllback){

    if(error_calllback == null){
        error_calllback = function(error) {
                console.log('error',error.responseText);
        }
    }

    $.ajax({
            url: url,
            type: type,
            dataType : dataType,
            data:data,
            success: success_callback,
            error:error_calllback,
            complete: function( xhr, status ) {
                console.log('complete');
            }
    });
}

/**
 * 显示验证码
 */
function show_sms_code(){
    console.log('show_sms_code()')
}

/**
 * 获取控件上的验证码的值
 * @returns {*|jQuery}
 */
function get_vcode(){
    var vcode = $("#vcode").val()
    if(!isNeedVerifyCode){
        vcode='';
    }
    return vcode;
}


/**
 * 账号检查 (与后台交互)
 */
function check_vc(){

    var success_callback = function( json ) {
                console.log('success');
                console.log(json);
                console.log(json.resp_msg);

                if(json.resp_code == 0){
                    if(json.resp_data){
                        $(".valcode").css("display","block");
                        $("#img_smscode").attr("src","/static/img/pic.jpg");
                        isNeedVerifyCode = true;
                    } else {
                        $('#tip_smscode').html("不需要验证码");
                        isNeedVerifyCode= false;
                    }

                    ischeck = true;

                } else {
                    alert(json);
                }
            }

    req_get('check','',success_callback);
}

/**
 * 获取验证码图片　（与后台交互）
 */
function get_captcha(){

    var success_callback = function(json){
        console.log('get_captcha()')
        if(json.resp_code == 0){
            //与前段做交互
            //alert();
            //显示验证码
            var tmp = (new Date().getTime())
            $("#img_smscode").attr("src","/static/img/pic.jpg"+"?"+tmp);
        } else {
            alert('获取验证码 error :'+json.resp_msg)
        }
    }
    req_get('getimage','',success_callback);
}

/**
 * 登录　(与后台交互)
 */
function login(){


    if(!ischeck){
        alert('please first check !')
        return;
    }

    var vcode = get_vcode();
    //转化为json形式
    vcode = JSON.stringify({'vcode':vcode});

    var success_callback = function(json){
        console.log(json)

        if(json.resp_code == 0){
            alert('ok')
        } else {
            alert('failer')
        }
    }

    req_post('login/vcode',vcode,success_callback)
}


function test_post(){

    var success_callback = function(json){
        console.log(json)

        if(json.resp_code == 0){
            //alert('ok')
        } else {
            //alert('failer')
        }
    }


    var data = 'r: {"ptwebqq":"dea75142dc6e91fd609e47c9c7c3fcd63d5d48f1a5631d2e2480825cab90d6b4","clientid":53999199,"psessionid":"","status":"online"}'
    data = JSON.stringify({'vcode':12344,'ttt':'dddd'});
    console.log('data='+data);
    $.ajax({
            url: 'test',
            type: 'post',
            data:'r:{"ptwebqq"="1111","clientid"=53999199,"psessionid"="","status"="online"}',
            success: success_callback,
            complete: function( xhr, status ) {
                console.log('complete');
            }
    });
}

