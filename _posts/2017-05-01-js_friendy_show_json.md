---
layout: post
title: js解析json格式(像console.log打印的格式)
tags: javscript json
categories: common
---

> console.log 控制台打印，可以友好的打印出有层次结构的json对象。pc端下屡试不爽。但如果在手机浏览器呢？alert可没有这个功能，所以自己也尝试写个函数来打印出层次结构清晰的json对象。

- 代码

```javascript
  /**
 * 解析对象成字符串
 * @param  {object} obj  待传入的对象
 * 其他变量省略
 **/
function parseObjToString(obj){
  var filter = ['top', 'window', 'document', 'localStorage', 'sessionStorage', 'cookie'], //不会解析该属性。
    x         = null, //没用的临时变量
    n         = '<br/>', //换行
    Parse     = {
      parse_obj : function(obj, blank, parse_obj_times){//解析对象和数组
        !parse_obj_times && (parse_obj_times = 0);
        if (parse_obj_times > 20) {return '';}
        switch(typeof obj){
          case 'object':
            var temp   = '{',
            isobj  = true;
            temp  += n;
            blank  = blank || 1;
            ''+{}.toString.call(obj) === "[object Array]" && (isobj = false);
            isobj ? temp = '{'+ n : temp = '['+ n;
            for (x in obj) {
              if (typeof obj[x] == 'object') {
                if(filter.indexOf(x) !== -1 ) continue;
                parse_obj_times ++;
                temp += this.get_head(blank, isobj) + this.parse_obj(obj[x], blank+1, parse_obj_times)+ ',' + n;
              }else{
                temp += this.get_head(blank, isobj) + this.parse_sign(obj[x]) +',' + n;
              }
            }
            temp = temp.substr(0, temp.length - (',' + n).length || 1)+ n;
            return temp + this.get_blank(blank - 1) + (isobj ? '}' : ']') ;
          default : 
              return obj;
        }
      },
      parse_sign: function(str){//解析特殊符号
          return (''+str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n|\\n\\r/g, '<br>')
                      .replace(/\\t/g, '&nbsp;&nbsp;')
                      .replace(/\\s\\s/g, '&nbsp;');
      },
      get_blank : function(num){//返回相应num的空白
          for (var i = 0, blank=''; i < num; i++) {
              blank += '&nbsp;&nbsp;&nbsp;&nbsp;';
          }
          return blank;
      },
      get_head: function(blank, isobj){
          return this.get_blank(blank)+ (isobj ? x+ ' : ' : '');
      }
  };
  return Parse.parse_obj(obj);
}
function printToBody(data){
  $('body').append('<br>'+parseObjToString(data));
}   

```

> 最后当我弄完后发现直接用JSON.stringify来得更直接
```javascript
  JSON.stringify(obj, undefined, '\t')
```