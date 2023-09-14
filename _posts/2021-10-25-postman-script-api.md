---
layout: post
title: 工具postman
tags: tool postman
categories: tool
---

* TOC
{:toc}

> 转载：[作者：adongs 标题：Postman Pre-request Script (postman脚本) 编写](https://adongs.com/articles/2020/08/10/1597044862445.html)

# POSTMAN 使用

## 环境变量

  ```javascript
      //设置当前环境变量
      pm.environment.set("key", "value");
      //获取当前环境变量
      pm.environment.get("key");
      //清除当前环境变量
      pm.environment.unset("key");
      //设置全局环境变量
      pm.globals.set("key", "value");
      //获取全局环境变量
      pm.globals.get("key");
      //清除全局环境变量
      pm.globals.unset("key");
      //在全局和当前环境变量中获取
      pm.variables.get("key");
      //设置集合
      pm.collectionVariables.set("key",["value1","value2","value3"])
      //获取集合
      pm.collectionVariables.get("key");
      //清除集合
      pm.collectionVariables.unset("key");
      //遍历集集合，遍历function(遍历当前值,索引,集合,)
      pm.collectionVariables.get("key").forEach(function(a,b,c){
      console.log(a);
      console.log(b);
      console.log(c);
      });
  ```

## GET请求

```javascript
    //获取当前请求方式,返回:string
    var method = pm.request.method;
    //输出当前请求信息,返回:json
    var request = pm.request.toJSON();
    //输出当前请求url,返回:string
    var url = pm.request.url.toString();
    //输出当前请求参数,参数(是否编码):true  false ,返回:string
    var querypararm =  pm.request.url.getQueryString(false);
    //获取请求参数,参数(请求的键值)(string 类型),返回:string
    var value = pm.request.url.query.get("key_name");
    //删除请求参数,参数(请求的键值)
    pm.request.url.query.remove("key_name");
    //添加请求参数,参数(添加请求参数),数组类型
    pm.request.url.query.add("key1=value1","key2=value2");
    //判断某个键值是否存在,返回:boolean
    var has = pm.request.url.query.has("key");
    内置请求
    //定义请求信息
    var requests = {
        url:url,//请求url
        method: 'POST',//请求方式
        header: {'Content-Type':'application/json'},//请求header
        body: {
        mode: 'raw',//数据模型
        raw: JSON.stringify({mobile:raw.mobile,useScene:"login"})//数据
      }
    };

    //发送请求,参数:请求信息,响应函数(异常,响应数据)
    pm.sendRequest(requests,function (err, response) {
          var result = response.json();
          console.log(result);
      
    });
```

## POST请求

```javascript
    //获取所有headers
    var header = pm.request.getHeaders();
    //移除header
    pm.request.removeHeader("key");
    //添加header
    pm.request.addHeader("key:value");
    //获得body中的内容,返回:string
    var body = pm.request.body.raw;
    //重新设置body内容,参数:string
    pm.request.body.update("");
    //添加param参数,参数:string或者QueryParam对象
    pm.request.addQueryParams("key=value");
    //移除para参数,参数:数组字符串
    pm.request.removeQueryParams("1","2");
```

## Cookies

```javascript
    //创建一个cookie容器
    const cookieJar = pm.cookies.jar();

    //设置cookie,参数: url,cookieName,cookieValue,回调函数function(异常,设置成功的cookie)
    /**
    * 如果设置失败,提示如下:Unable to access "xxxx.com" cookie store. Try    whitelisting the domain in "Manage Cookies 
    * 点击界面的 Cookies > Whitelist Domains(左下角) > 在输入框中加入xxxx.com 点击
    * add
    */
    cookieJar.set("xxxx.com","name","value",function(error,cookie){
    console.log(error);
    console.log(cookie);
    })

    //获取cookie,参数: url,cookieName,回调函数function(异常,cookie)
    cookieJar.get("xxxx.com","name",function(error,cookie){
    console.log(error);
    console.log(cookie);
    })

    //获取所有cookie,参数: url,回调函数function(异常,cookie)
    cookieJar.getAll("xxxx.com", function(error, cookies){
    console.log(error);
    console.log(cookie);
    });

    //删除cookie,参数: url,cookieName,回调函数function(异常)
    cookieJar.unset("xxxx.com", "name", function(error){
    console.log(error);
    });

    //删除所有cookie,参数: url,回调函数function(异常)
    cookieJar.clear("xxxx.com", "name", function(error){
    console.log(error);
    });

```

## 工具

```javascript
    //字符串转json对象
    var json =JSON.parse("");

    //json对象转字符串
    var string = JSON.stringify(obj);

    //获取当前时间的时间格式
    var time = require('moment')().format("YYYY-MM-DD HH:mm:ss");

    //参数编码参数
    var encodeURI = encodeURIComponent("");

    //编码整个url
    var encodeURI = encodeURI("");

    //base64编码
    var content = CryptoJS.enc.Utf8.parse("1");
    var base64Content = CryptoJS.enc.Base64.stringify(content);

    //base64解码
    var parsedWordArray = CryptoJS.enc.Base64.parse(base64Content);
    var wordString = parsedWordArray.toString(CryptoJS.enc.Utf8);

    //xml转换json对象,参数：请求响应的xml
    var jsonObject = xml2Json(responseBody);

    //解析响应的csv
    const parse = require('csv-parse/lib/sync');
    const responseJson = parse(pm.response.text());

    //解析html
    const $ = cheerio.load(pm.response.text());
    console.log($.html());

    //MD5加密
    var md5 = CryptoJS.MD5("").toString();

    //SHA1加密
    var sha1 = CryptoJS.SHA1("").toString();

    //AES加密
    const keys = CryptoJS.enc.Utf8.parse("123456789");//秘钥
    const ivs = CryptoJS.enc.Utf8.parse('tltlaycvtweasa');//偏移量
    let encryptedWord = CryptoJS.enc.Utf8.parse("1");//加密内容
    var encrypted = CryptoJS.AES.encrypt(encryptedWord, keys, { iv: ivs,mode:CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}); //加密结果
    var ciphertext = encrypted.toString(); //密文
```

## Tests编写

```javascript
    值获取
    //请求耗时
    var time = pm.response.responseTime;
    //获取响应code
    var code = pm.response.code;
    //获取错误描述:例如返回200,下面返回的是OK
    var status = pm.response.status;
    //获取响应数据
    var data = pm.response.json();
    //获取响应header
    var header = pm.response.headers.get("key");
    模板判断
    //断言响应中是否包含指定字符串
    pm.test("断言响应体包含指定字符串", function () {
        pm.expect(pm.response.text()).to.include("指定字符串");
    });


    //断言响应是否等于指定字符串
    pm.test("断言响应是否等于指定字符串", function () {
        pm.response.to.have.body("指定字符串");
    });
    

    //断言json值是否等于指定值
    pm.test("断言json值是否等于指定值", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.value).to.eql(100);
    });

    //断言是否存在Content-Type标头
    pm.test("断言是否存在Content-Type标头", function () {
        pm.response.to.have.header("Content-Type");
    });

    //断言cookie是否存在
    pm.test("断言cookie是否存在", () => {
      pm.expect(pm.cookies.has('JSESSIONID')).to.be.true;
    });

    //断言cookie是否等于特定值
    pm.test("断言cookie是否等于特定值", () => {
      pm.expect(pm.cookies.get('JSESSIONID')).to.eql('1');
    });

    //断言响应时间小于200ms
    pm.test("断言响应时间小于200ms", function () {
        pm.expect(pm.response.responseTime).to.be.below(200);
    });

    //断言状态码为200
    pm.test("断言状态码为200", function () {
        pm.response.to.have.status(200);
    });


    //断言状态响应说明是否包指定值
    pm.test("断言状态响应说明是否包指定值", function () {
        pm.response.to.have.status("Created");
    });

    //断言成功响应状态码,oneOf表示在一组值中
    pm.test("断言成功响应状态码", function () {
        pm.expect(pm.response.code).to.be.oneOf([201,202]);
    });

    //断言环境值和响应回来的值
    pm.test("断言环境值和响应回来的值", function () {
      pm.expect(pm.response.json().name).to.eql(pm.environment.get("name"));
    });

    //断言响应数据类型
    /* 响应数据结构如下
    {
      "name": "Jane",
      "age": 29,
      "hobbies": [
        "skating",
        "painting"
      ],
      "email": null
    }
    */
    const jsonData = pm.response.json();
    pm.test("Test data type of the response", () => {
      pm.expect(jsonData).to.be.an("object");//是否为对象类型
      pm.expect(jsonData.name).to.be.a("string");//是否为字符串类型
      pm.expect(jsonData.age).to.be.a("number");//是否为数字类型
      pm.expect(jsonData.hobbies).to.be.an("array");//是否为数组
      pm.expect(jsonData.website).to.be.undefined;//是否未定义
      pm.expect(jsonData.email).to.be.null;//是否为null
    });

    //断言数组
    /* 响应数据结构如下
    {
      "errors": [],
      "areas": [ "goods", "services" ],
      "settings": [
        {
          "type": "notification",
          "detail": [ "email", "sms" ]
        },
        {
          "type": "visual",
          "detail": [ "light", "large" ]
        }
      ]
    }
    */
    const jsonData = pm.response.json();
    pm.test("Test array properties", () => {
        //判断是否为空
      pm.expect(jsonData.errors).to.be.empty;
        //判断是否包含 "goods"
      pm.expect(jsonData.areas).to.include("goods");
        //判断 settings 中的object是否有type='notification'
      const notificationSettings = jsonData.settings.find
          (m => m.type === "notification");
      pm.expect(notificationSettings)
        .to.be.an("object", "Could not find the setting");
        //判断是否notificationSettings.detail中是否包含"sms"
      pm.expect(notificationSettings.detail).to.include("sms");
        //判断是否notificationSettings.detail中是否包含如下所有成员
      pm.expect(notificationSettings.detail)
        .to.have.members(["email", "sms"]);
    });

    //断言一个对象包含键或属性
    //断言包含所有的key
    pm.expect({a: 1, b: 2}).to.have.all.keys('a', 'b');
    //断言包含任何一个成员
    pm.expect({a: 1, b: 2}).to.have.any.keys('a', 'b');
    //断言不包含任何一个成员
    pm.expect({a: 1, b: 2}).to.not.have.any.keys('c', 'd');
    //断言是否包含a属性
    pm.expect({a: 1}).to.have.property('a');
    //断言值是否为object对象,并且包含所有的key
    pm.expect({a: 1, b: 2}).to.be.an('object')
      .that.has.all.keys('a', 'b');

    //TV4校验

    //定义校验模型,要求值为boolean类型
    var schema = {
    "items": {
    "type": "boolean"
    }
    };
    //定义测试数据
    //满足要求
    var data1 = [true, false];
    //不满足要求
    var data2 = [true, 123];
    //校验TV4模型
    pm.test('校验TV4模型', function() {
      pm.expect(tv4.validate(data1, schema)).to.be.true;
      pm.expect(tv4.validate(data2, schema)).to.be.true;
    });


    //JSON模型校验

    //构建Ajv
    var Ajv = require('ajv');
    //初始化
    var ajv = new Ajv({logger: console})
    //定义规则
    var schema = {
            "properties": {
                "alpha": {
                    "type": "boolean"
                }
            }
        };
    //定义测试数据
    //符合规则
    var test1 = {alpha: true};
    //不符合规则
    var test2 = {alpha: 123};
    //校验
    pm.test('JSON模型校验', function() {
        pm.expect(ajv.validate(schema, test1)).to.be.true;
        pm.expect(ajv.validate(schema, test2)).to.be.false;
    });



    //将请求结果可视化
    //数据样例
    /**
    [
        {
            "name": "Alice",
            "email": "alice@example.com"
        },
        {
            "name": "Jack",
            "email": "jack@example.com"
        },
        // ... and so on
    ]
    */
    //数据模板
    var template = `
        <table bgcolor="#FFFFFF">
            <tr>
                <th>Name</th>
                <th>Email</th>
            </tr>

            {{#each response}}
                <tr>
                    <td>{{name}}</td>
                    <td>{{email}}</td>
                </tr>
            {{/each}}
        </table>
    `;
    //填充数据模板
    pm.visualizer.set(template, {
        response: pm.response.json()
    });
    
```

## 动态变量

```javascript
    //动态变量获取
    pm.variables.replaceIn('{{$randomFirstName}}');

    //动态变量获取
    pm.variables.replaceIn('{{$randomFirstName}}');
```

## 值列表

<table align="center">
  <tr>
    <th align="center">变量名</th>
    <th align="center">描述</th>
    <th align="center">例子</th>
  </tr>
  <tr><td> $guid </td><td> 一个uuid-v4风格GUI</td><td> | "611c2e81-2ccb-42d8-9ddc-2d0bfa65c1b4" </td></tr>
<tr><td> $timestamp </td><td> 当前UNIX时间戳（以秒为单位） </td><td> 1562757107 </td></tr>
<tr><td> $isoTimestamp </td><td> 当前ISO时间戳（UTC为零） </td><td> 2020-06-09T21:10:36.177Z </td></tr>
<tr><td> $randomUUID </td><td> 随机的36个字符的UUID </td><td> "6929bb52-3ab2-448a-9796-d6480ecad36b" </td></tr>
<tr><td> $randomAlphaNumeric </td><td> 随机字母数字字符 </td><td> 6, "y", "z" </td></tr>
<tr><td> $randomBoolean </td><td> 随机布尔值（真/假</td><td> | true, false, false, true </td></tr>
<tr><td> $randomInt </td><td> 1至1000之间的随机整数 </td><td> 802, 494, 200 </td></tr>
<tr><td> $randomColor </td><td> 随机颜色 </td><td> "red", "fuchsia", "grey" </td></tr>
<tr><td> $randomHexColor </td><td> 随机十六进制值 </td><td> "#47594a", "#431e48", "#106f21" </td></tr>
<tr><td> $randomAbbreviation </td><td> 随机缩写 </td><td> SQL, PCI, JSON </td></tr>
<tr><td> $randomIP </td><td> 随机的IPv4地址 </td><td> 241.102.234.100,  216.7.27.38 </td></tr>
<tr><td> $randomIPV6 </td><td> 随机的IPv6地址 </td><td> dbe2:7ae6:119b:c161:1560:6dda:3a9b:90a9 </td></tr>
<tr><td> $randomMACAddress </td><td> 随机MAC地址 </td><td> 33:d4:68:5f:b4:c7,  1f:6e:db:3d:ed:fa </td></tr>
<tr><td> $randomPassword </td><td> 随机的15个字符的字母数字密码 </td><td> t9iXe7COoDKv8k3,  QAzNFQtvR9cg2rq </td></tr>
<tr><td> $randomLocale </td><td> 随机的两个字母的语言代码（ISO 63</td><td>-1） | "ny", "sr", "si" </td></tr>
<tr><td> $randomUserAgent </td><td> 随机用户代理 </td><td> Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.9.8; rv:15.6) Gecko/20100101 Firefox/15.6.6 Opera/10.27 (Windows NT 5.3; U; AB Presto/2.9.177 Version/10.00) </td></tr>
<tr><td> $randomProtocol </td><td> 随机互联网协议 </td><td> "http",  "https" </td></tr>
<tr><td> $randomSemver </td><td> 随机语义版本号 </td><td> 7.0.5, 2.5.8, 6.4.9 </td></tr>
<tr><td> $randomFirstName </td><td> 随机名字 </td><td> Ethan, Chandler, Megane </td></tr>
<tr><td> $randomLastName </td><td> 随机姓氏 </td><td> Schaden, Schneider, Willms </td></tr>
<tr><td> $randomFullName </td><td> 随机的名字和姓氏 </td><td> Connie Runolfsdottir, Sylvan Fay, Jonathon Kunze </td></tr>
<tr><td> $randomNamePrefix </td><td> 随机名称前缀 </td><td> Dr., Ms., Mr. </td></tr>
<tr><td> $randomNameSuffix </td><td> 随机名称后缀 </td><td> I, MD, DDS </td></tr>
<tr><td> $randomCountryCode </td><td> 随机的2个字母的国家/地区代码（IS</td><td> 3166-1 alpha-2） | CV, MD, TD </td></tr>
<tr><td> $randomLatitude </td><td> 随机纬度坐标 </td><td> 55.2099, 27.3644, -84.7514 </td></tr>
<tr><td> $randomLongitude </td><td> 随机经度坐标 </td><td> 40.6609, 171.7139, -159.9757 </td></tr>
<tr><td> $randomImage </td><td> 随机图像 </td><td> http://lorempixel.com/640/480/technics </td></tr>
<tr><td> $randomAvatarImage </td><td> 随机头像 </td><td> https://s3.amazonaws.com/uifaces/faces/twitter/johnsmithagency/128.jpg </td></tr>
<tr><td> $randomImageUrl </td><td> 随机图片的网址 </td><td> http://lorempixel.com/640/480 </td></tr>
<tr><td> $randomAbstractImage </td><td> 随机抽象图片的网址 </td><td> http://lorempixel.com/640/480/abstract </td></tr>
<tr><td> $randomAnimalsImage </td><td> 随机动物图片的网址 </td><td> http://lorempixel.com/640/480/animals </td></tr>
<tr><td> $randomBusinessImage </td><td> 随机库存企业图片的网址 </td><td> http://lorempixel.com/640/480/business </td></tr>
<tr><td> $randomCatsImage </td><td> 随机猫图像的URL </td><td> http://lorempixel.com/640/480/cats </td></tr>
<tr><td> $randomCityImage </td><td> 随机城市图片的网址 </td><td> http://lorempixel.com/640/480/city </td></tr>
<tr><td> $randomFoodImage </td><td> 随机食物图片的网址 </td><td> http://lorempixel.com/640/480/food </td></tr>
<tr><td> $randomNightlifeImage </td><td> 随机夜生活图片的网址 </td><td> http://lorempixel.com/640/480/nightlife </td></tr>
<tr><td> $randomFashionImage </td><td> 随机时尚图片的网址 </td><td> http://lorempixel.com/640/480/fashion </td></tr>
<tr><td> $randomPeopleImage </td><td> 一个人的随机图像的URL </td><td> http://lorempixel.com/640/480/people </td></tr>
<tr><td> $randomNatureImag </td><td> 随机自然图像的URL </td><td> http://lorempixel.com/640/480/nature </td></tr>
<tr><td> $randomSportsImage </td><td> 随机运动图像的URL </td><td> http://lorempixel.com/640/480/sports </td></tr>
<tr><td> $randomTechnicsImage </td><td> 随机技术图片的网址 </td><td> http://lorempixel.com/640/480/technics </td></tr>
<tr><td> $randomTransportImage </td><td> 随机交通图片的网址 </td><td> http://lorempixel.com/640/480/transport </td></tr>
<tr><td> $randomImageDataUri </td><td> 随机图像数据URI </td><td> data:image/svg+xml;charset=UTF-8,%3Csvg+xmlns%3D%22http%3A%2F%2Fwww...... </td></tr>
<tr><td> $randomCurrencyCode </td><td> 随机的3个字母的货币代码（ISO-4217</td><td> | CDF, ZMK, GNF </td></tr>
<tr><td> $randomBitcoin </td><td> 随机比特币地址 </td><td> 3VB8JGT7Y4Z63U68KGGKDXMLLH5 </td></tr>
<tr><td> $randomCompanyName </td><td> 随机公司名称 </td><td> Johns - Kassulke,  Grady LLC </td></tr>
<tr><td> $randomBsNoun </td><td> | interface</td><td> </td></tr>
<tr><td> $randomDatabaseType </td><td> 随机数据库类型 </td><td> tinyint,  text </td></tr>
<tr><td> $randomDatabaseColumn </td><td> 随机数据库列名称 </td><td> updatedAt, token, group </td></tr>
<tr><td> $randomDatabaseCollation </td><td> 随机数据库排序 </td><td> cp1250_bin, utf8_general_ci, cp1250_general_ci </td></tr>
<tr><td> $randomDatabaseEngine </td><td> 随机数据库引擎 </td><td> MyISAM, InnoDB, Memory </td></tr>
<tr><td> $randomDateFuture </td><td> 未来的随机日期时间 </td><td> Tue Mar 17 2020 13:11:50 GMT+0530 (India Standard Time) </td></tr>
<tr><td> $randomDatePast </td><td> 随机过去的日期时间 </td><td> Sat Mar 02 2019 09:09:26 GMT+0530 (India Standard Time) </td></tr>
<tr><td> $randomDateRecent </td><td> 最近的随机日期时间 </td><td> Tue Jul 09 2019 23:12:37 GMT+0530 (India Standard Time) </td></tr>
<tr><td> $randomWeekday </td><td> 随机工作日 </td><td> Thursday, Friday, Monday </td></tr>
<tr><td> $randomMonth </td><td> 随机月份 </td><td> February, May, January </td></tr>
<tr><td> $randomDomainName </td><td> 随机域名 </td><td> gracie.biz, armando.biz, trevor.info </td></tr>
<tr><td> $randomDomainSuffix </td><td> 随机域后缀 </td><td> org, net, com </td></tr>
<tr><td> $randomDomainWord </td><td> 随机的不合格域名 </td><td> gwen, jaden, donnell </td></tr>
<tr><td> $randomEmail </td><td> 随机电子邮件地址 </td><td> Pablo62@gmail.com, Ruthe42@hotmail.com, Iva.Kovacek61@hotmail.com </td></tr>
<tr><td> $randomExampleEmail </td><td> 来自“示例”域的随机电子邮件地址 </td><td> Talon28@example.com, Quinten_Kerluke45@example.net, Casey81@example.net </td></tr>
<tr><td> $randomUserName </td><td> 随机用户名 </td><td> Jarrell.Gutkowski, Lottie.Smitham24, Alia99 </td></tr>
<tr><td> $randomUrl </td><td> 随机网址 </td><td> https://anais.net, https://tristin.net, http://jakob.name </td></tr>
<tr><td> $randomFileName </td><td> 随机文件名（包括不常见的扩展名） </td><td> neural_sri_lanka_rupee_gloves.gdoc </td></tr>
<tr><td> $randomFileType </td><td> 随机文件类型（包括不常见的文件类型） </td><td> model, application, video </td></tr>
<tr><td> $randomFileExt </td><td> 随机文件扩展名（包括不常见的扩展名） </td><td> war, book, fsc </td></tr>
<tr><td> $randomCommonFileName </td><td> 随机文件名 </td><td> well_modulated.mpg4 </td></tr>
<tr><td> $randomCommonFileType </td><td> 随机的常见文件类型 </td><td> application,  audio </td></tr>
<tr><td> $randomCommonFileExt </td><td> 随机的通用文件扩展名 </td><td> m2v, wav, png </td></tr>
<tr><td> $randomFilePath </td><td> 随机文件路径 </td><td> /home/programming_chicken.cpio </td></tr>
<tr><td> $randomDirectoryPath </td><td> 随机目录路径 </td><td> /usr/bin, /root, /usr/local/bin </td></tr>
<tr><td> $randomMimeType </td><td> 随机MIME类型 </td><td> audio/vnd.vmx.cvsd </td></tr>
</table>
