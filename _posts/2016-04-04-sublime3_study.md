---
layout: post
title: sublime text 3使用
tags: sublime
categories: common
---

##### 一、插件篇:
1、安装package control
  - 打开package control 的[安装页面](https://packagecontrol.io/installation) 
  - 复制安装代码到 sublime 的控制台上 (打开控制台: ```ctrl + ~```) 执行
  ```
    import urllib.request,os,hashlib; h = '2915d1851351e5ee549c20394736b442' + '8bc59f460fa1548d1514676163dafc88'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); by = urllib.request.urlopen( 'http://packagecontrol.io/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); print('Error validating download (got %s instead of %s), please try manual install' % (dh, h)) if dh != h else open(os.path.join( ipp, pf), 'wb' ).write(by)
  ```
  - 安装成功后，重启sublime。 重启后，可以通过菜单上的Preferences 中查找是否有 Package Control 菜单，来确定package control是否安装成功。

2. 安装其他插件:
  步骤：
    - 通过快捷键调出 安装面板。 
    - (ctrl + shift + p) 然后大概输入 package control install 
    - 确认就打开安装插件面板。\

2.1 Emmet: 代码补全。
2.2 Alignment: 对齐
2.3 DocBlockr:文档生成
  - 配置:添加author
  ```json
    {
      "jsdocs_extra_tags": ["@author jenson"] 
    }
  ```
2.4、Ctag安装与配置：
- 打开命令框（快捷键 Ctrl+Shift+p）：输入 PCI 跳到控制包安装。然后查找 CTag，安装。

- 下载ctags58.zip，解压，然后将路径放入环境变量中。 D:\\ctags58

- 重启sublime text

- 在侧左栏的工程/项目文件上右键会看到CTags: Rebuild Tags菜单项。点击CTags: Rebuild Tags 即可生成

6、Sublimelinter :
  - 首先安装sublimelinter,然后安装sublimelinter-php。
  - 配置：将php的目录写入sublimelinter的配置中 重启即可
  - 配置主要参数，尤其是下面的php路径
    ```javascript
      "debug": true,
      "lint_mode": "save only",
      "paths": {
        "linux": [],
        "osx": [],
        "windows": [
          "D:\\\\xampp\\\\php"
        ]
      },
    ```
##### 二、面板快捷方式
- ```ctrl + p```: 打开搜索文件面板, 查找当前项目目录内的文件
- ```ctrl + shift + p```: 命令面板
- ```ctrl + r```: 搜索当前页面的function
- ```ctrl + g```: 跳转当前页面的行

##### 三、创建snippet片段
  - 文件命名: snippetname-code.sublime-snippet
  - 配置 
      ```xml
        <snippet>
          <content>
            <![CDATA[Hello, ${1:this} is a ${2:snippet}.]]>
          </content>
          <!-- Optional: Set a tabTrigger to define how to trigger the snippet -->
          <!-- <tabTrigger>snippetname</tabTrigger> -->
          <!-- Optional: Set a scope to limit where the snippet will trigger -->
          <!-- <scope>source.python</scope> -->
        </snippet>
      ```
  - 例子 filename: tmpecho
    content:
    ```xml
      <snippet>
        <content>
          <![CDATA[<%= ${1:code} %>]]>
        </content>
        <tabTrigger>tmpecho</tabTrigger>
        <description>template-snip</description>
        <scope>text.html,source.js</scope>
      </snippet>
    ```
    usage: ```tmecho + tab```
    result: ```<%=  %>```
##### 四、更多快捷键
  - ```Ctrl+Shift+P```：打开命令面板
  - ```Ctrl+P```：搜索项目中的文件
  - ```Ctrl+G```：跳转到第几行
  - ```Ctrl+W```：关闭当前打开文件
  - ```Ctrl+Shift+W```：关闭所有打开文件
  - ```Ctrl+Shift+V```：粘贴并格式化
  - ```Ctrl+D```：选择单词，重复可增加选择下一个相同的单词
  - ```Ctrl+L```：选择行，重复可依次增加选择下一行
  - ```Ctrl+Shift+L```：选择多行
  - ```Ctrl+Shift+Enter```：在当前行前插入新行
  - ```Ctrl+X```：删除当前行
  - ```Ctrl+M```：跳转到对应括号
  - ```Ctrl+U```：软撤销，撤销光标位置
  - ```Ctrl+J```：选择标签内容
  - ```Ctrl+F```：查找内容
  - ```Ctrl+Shift+F```：查找并替换
  - ```Ctrl+H```：替换
  - ```Ctrl+R```：前往 method
  - ```Ctrl+N```：新建窗口
  - ```Ctrl+K+B```：开关侧栏
  - ```Ctrl+Shift+M```：选中当前括号内容，重复可选着括号本身
  - ```Ctrl+F2```：设置/删除标记
  - ```Ctrl+/```：注释当前行
  - ```Ctrl+Shift+/```：当前位置插入注释
  - ```Ctrl+Alt+/```：块注释，并Focus到首行，写注释说明用的
  - ```Ctrl+Shift+A```：选择当前标签前后，修改标签用的
  - ```F11```：全屏
  - ```Shift+F11```：全屏免打扰模式，只编辑当前文件
  - ```Alt+F3```：选择所有相同的词
  - ```Alt+.```：闭合标签
  - ```Alt+Shift+数字```：分屏显示
  - ```Alt+数字```：切换打开第N个文件
  - ```Shift+右键拖动```：光标多不，用来更改或插入列内容
  - 鼠标的前进后退键可切换Tab文件
  - 按Ctrl，依次点击或选取，可需要编辑的多个位置
  - 按Ctrl+Shift+上下键，可替换行
##### 选择类
  - ```Ctrl+D``` 选中光标所占的文本，继续操作则会选中下一个相同的文本。
  - ```Alt+F3``` 选中文本按下快捷键，即可一次性选择全部的相同文本进行同时编辑。举个栗子：快速选中并更改所有相同的变量名、函数名等。
  - ```Ctrl+L``` 选中整行，继续操作则继续选择下一行，效果和 Shift+↓ 效果一样。
  - ```Ctrl+Shift+L``` 先选中多行，再按下快捷键，会在每行行尾插入光标，即可同时编辑这些行。
  - ```Ctrl+Shift+M``` 选择括号内的内容（继续选择父括号）。举个栗子：快速选中删除函数中的代码，重写函数体代码或重写括号内里的内容。
  - ```Ctrl+M``` 光标移动至括号内结束或开始的位置。
  - ```Ctrl+Enter``` 在下一行插入新行。举个栗子：即使光标不在行尾，也能快速向下插入一行。
  - ```Ctrl+Shift+Enter``` 在上一行插入新行。举个栗子：即使光标不在行首，也能快速向上插入一行。
  - ```Ctrl+Shift+[``` 选中代码，按下快捷键，折叠代码。
  - ```Ctrl+Shift+]``` 选中代码，按下快捷键，展开代码。
  - ```Ctrl+K+0``` 展开所有折叠代码。
  - ```Ctrl+←``` 向左单位性地移动光标，快速移动光标。
  - ```Ctrl+→``` 向右单位性地移动光标，快速移动光标。
  - ```shift+↑``` 向上选中多行。
  - ```shift+↓``` 向下选中多行。
  - ```Shift+←``` 向左选中文本。
  - ```Shift+→``` 向右选中文本。
  - ```Ctrl+Shift+←``` 向左单位性地选中文本。
  - ```Ctrl+Shift+→``` 向右单位性地选中文本。
  - ```Ctrl+Shift+↑``` 将光标所在行和上一行代码互换（将光标所在行插入到上一行之前）。
  - ```Ctrl+Shift+↓``` 将光标所在行和下一行代码互换（将光标所在行插入到下一行之后）。
  - ```Ctrl+Alt+↑``` 向上添加多行光标，可同时编辑多行。
  - ```Ctrl+Alt+↓``` 向下添加多行光标，可同时编辑多行。
##### 编辑类
  - ```Ctrl+J``` 合并选中的多行代码为一行。举个栗子：将多行格式的CSS属性合并为一行。
  - ```Ctrl+Shift+D``` 复制光标所在整行，插入到下一行。
  - ```Tab``` 向右缩进。
  - ```Shift+Tab``` 向左缩进。
  - ```Ctrl+K+K``` 从光标处开始删除代码至行尾。
  - ```Ctrl+Shift+K``` 删除整行。
  - ```Ctrl+/``` 注释单行。
  - ```Ctrl+Shift+/``` 注释多行。
  - ```Ctrl+K+U``` 转换大写。
  - ```Ctrl+K+L``` 转换小写。
  - ```Ctrl+Z``` 撤销。
  - ```Ctrl+Y``` 恢复撤销。
  - ```Ctrl+U``` 软撤销，感觉和 Gtrl+Z 一样。
  - ```Ctrl+F2``` 设置书签
  - ```Ctrl+T``` 左右字母互换。
  - ```F6``` 单词检测拼写
##### 搜索类
  - ```Ctrl+F``` 打开底部搜索框，查找关键字。
  - ```Ctrl+shift+F``` 在文件夹内查找，与普通编辑器不同的地方是sublime允许添加多个文件夹进行查找，略高端，未研究。
  - ```Ctrl+P``` 打开搜索框。举个栗子：1、输入当前项目中的文件名，快速搜索文件，2、输入@和关键字，查找文件中函数名，3、输入：和数字，跳转到文件中该行代码，4、输入#和关键字，查找变量名。
  - ```Ctrl+G``` 打开搜索框，自动带：，输入数字跳转到该行代码。举个栗子：在页面代码比较长的文件中快速定位。
  - ```Ctrl+R``` 打开搜索框，自动带@，输入关键字，查找文件中的函数名。举个栗子：在函数较多的页面快速查找某个函数。
  - ```Ctrl+：``` 打开搜索框，自动带#，输入关键字，查找文件中的变量名、属性名等。
  - ```Ctrl+Shift+P``` 打开命令框。场景栗子：打开命名框，输入关键字，调用sublime text或插件的功能，例如使用package安装插件。
  - ```Esc``` 退出光标多行选择，退出搜索框，命令框等。


