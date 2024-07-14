---
layout: post
title: python打包成exe可执行文件
tags: python pyinstaller
categories: backend
---

* TOC
{:toc}

# python打包成exe可执行文件

> 由于需要将脚本给小白用，需要打包成exe直接执行

## 使用pyinstaller导出exe

* <a href="http://www.pyinstaller.org" title="pyinstaller 安装" target="_blank">安装</a> ```pip install pyinstaller```

* 使用 ```pyinstaller [option] ~/myproject/source/myscript.py```

  * option:

    | 可选参数 | 功能说明 |
    | -- | -- |
    | ```-D, --onedir```| 创建一个包含可执行文件的单文件夹捆绑包（默认） |
    | ```-F, --onefile```| 创建一个文件捆绑可执行文件。 |
    | ```--specpath DIR```|用于存储生成的规范文件的文件夹（默认：当前目录） |
    | ```-n NAME, --name NAME```|应用程序名称 |

  * 示例： `pyinstaller --onefile  --clean ./myscript.py`

* <img src="/static/img/pyinstall.jpg" alt="pyinstaller打包后运行示例">

* 参考
  * <https://zhuanlan.zhihu.com/p/38659588>
  * <https://pyinstaller.readthedocs.io/en/stable/usage.html#>
