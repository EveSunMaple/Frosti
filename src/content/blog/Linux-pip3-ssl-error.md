---
draft: true
title: "[Linux] CentOS7 中 pip3 install 可能出现的 ssl 问题"
pubDate: "2023-07-20"
description: "执行pip3 install, 可能会警告 WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available."
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307210054736.webp
categories:
    - Blogs
tags:
    - Linux使用问题
---

> 由于解决问题之后, 才写的博客, 所以没有图片记录.
>
> 尽量描述清楚一些

今天写代码的时候, 突然发现 文件里用了`#define`定义宏之后, `coc.nvim`的`coc-clangd`补全就用不了

`:checkhealth`了一下, 发现`nvim`忘记支持`python3`了

尝试`pip3 install neovim`的时候, 发现会警告然后安装失败.

截图就没有了, 警告第一句大概是:

**`WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.`**

大概的意思是`Python`安装没有编译支持 `SSL/TLS` 加密的模块, 如果没有 `SSL/TLS` 支持, 就可能无法安装某些需要安全连接的`Python`包

然后, 就开始踩坑了

## 踩坑

先尝试重新编译安装`python3`:

```shell
# 没有解决问题, 不要尝试
# 去到python源码路径下 
make clean
./configure --prefix=/usr/local/python3 --with-ssl
make
make install
```

然后`make`编译出问题:

**`Could not build the ssl module!`**

**`Python requires an OpenSSL 1.0.2 or 1.1 compatible libssl with X509_VERIFY_PARAM_set1_host().`**

**`LibreSSL 2.6.4 and earlier do not provide the necessary APIs`**

出现这个的原因是, `CentOS7`执行`sudo yum install openssl-devel`安装的`openssl`版本是`1.0.2`太老了

---

然后我又去下载了`openssl1.1.1`的源码 并且按照官网文档进行了编译安装.

```shell
# 官方文档安装步骤
wget https://www.openssl.org/source/openssl-1.1.1g.tar.gz
tar zxvf openssl-1.1.1g.tar.gz
cd openssl-1.1.1g
./config --prefix=/usr/local/openssl1.1.1 --openssldir=/usr/local/openssl1.1.1 no-ssl2
make
make install

# 安装完成之后, 还按照官方文档 添加了环境变量
export PATH=/usr/local/openssl1.1.1/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/openssl1.1.1/lib
export LC_ALL="en_US.UTF-8"
export LDFLAGS="-L /usr/local/openssl1.1.1/lib -Wl,-rpath,/usr/local/openssl1.1.1/lib"
```

然后, 重启了服务器, 执行`openssl version`会显示`OpenSSL 1.1.1g  21 Apr 2020`

再次去尝试编译安装`python3`:

```cpp
# 没有解决问题, 不要尝试
# 去到python源码路径下 
make clean
./configure --prefix=/usr/local/python3 --with-ssl=/usr/local/openssl-1.1.1
make
make install
```

然而, 并没有解决问题.

`make`还是会出现相同的问题:

**`Could not build the ssl module!`**

**``Python requires an OpenSSL 1.0.2 or 1.1 compatible libssl with X509_VERIFY_PARAM_set1_host().`**

**`LibreSSL 2.6.4 and earlier do not provide the necessary APIs`**

但是, 明明已经安装了`openssl1.1.1`而且也指定了`openssl1.1.1`的库和软件

也把`makefile`里所有的`/usr/local/openssl`改成了`/usr/local/openssl1.1.1`

但还是没用.

## 解决

因为补全很重要, 所以一直在找怎么解决

终于, 在这篇提问中找到了解决方案:

https://stackoverflow.com/questions/60536472/building-python-and-openssl-from-source-but-ssl-module-fails

提问的某楼中提到, `CentOS7`可以直接用`yum`安装`openssl1.1.1`:

```py
sudo yum install openssl11 openssl11-devel
mkdir /usr/local/openssl11
cd /usr/local/openssl11
ln -s /usr/lib64/openssl11 lib
ln -s /usr/include/openssl11 include
```

可以直接安装`openssl1.1.1`, 并将相应的库和包含 软连接到了 `/usr/local/openssl11/lib` 和 `/usr/local/openssl11/include`下

然后我再次 尝试重新编译安装`python3`:

```cpp
# 去到python源码路径下 
make clean
./configure --prefix=/usr/local/python3 --with-ssl=/usr/local/openssl11
make
```

这一次`make`没有再报`ssl`相关错误:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722162355382.webp)

然后`make install`将`python3`安装

安装成功之后, 进行软连接:

```shell
# 备份 python 和 pip
mv /usr/bin/python /usr/bin/python.bak
mv /usr/bin/python3 /usr/bin/python3.bak
mv /usr/bin/pip3 /usr/bin/pip3.bak
# 建立软连接
ln -s /usr/local/python3/bin/python3 /usr/bin/python
ln -s /usr/local/python3/bin/python3 /usr/bin/python3
ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3
```

然后 尝试执行`pip3 install neovim`:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722162357249.webp)

没有再报 **`WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.`** 警告.

然后打开`neovim`执行`:checkhealth`

可以看到, `python3`成功被支持, `coc.nvim`也没有配置错误:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722162359451.webp)

问题解决~

感谢阅读~