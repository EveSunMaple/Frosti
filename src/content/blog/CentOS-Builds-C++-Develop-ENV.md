---
draft: true
title: "[CentOS 7.6]从零开始搭建C/C++开发环境(废弃)"
pubDate: "2023-03-19"
description: "前几天, 在云服务器里删了一些东西, 导致丢失了一些文件和软件的相关配置. 导致C/C++的开发环境用着及其不舒服, 所以重新搭建了一遍, 顺手写了这一篇文章"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251817103.webp
categories: ['tech']
tags: ["Linux使用问题"]
---

前几天, 在云服务器里删了一些东西, 导致丢失了一些文件和软件的相关配置.

导致C/C++的开发环境用着及其不舒服, 所以重新搭建了一遍, 顺手写了这一篇文章

这篇文章的主要目的就是, **`在一个什么都没有的CentOS7.6环境下, 搭建一个依靠 Neovim 和 Coc-nvim 的C/C++补全开发环境`**

> 本片文章的环境是 `Xshell + Xftp + CentOS7.6`
>
> 博主提供的有安装软件相关版本的资源包, 所以可以使用`Xftp`向系统中传输文件

---

# 准备工作

本篇文章 环境主要围绕 C/C++ 搭建.

最终会搭建一套, 可以使用 Neovim 和 Coc.nvim 编写 C/C++ 代码, 并提供代码补全、错误提示等功能

文章会以 gcc -> cmake -> node&npm -> python3.8 -> llvm+clang -> neovim -> gdb11.2的顺序安装软件

最好**`按照此顺序及博主的软件版本进行安装`**, 否则可能会有某种错误, 会非常麻烦

> 这是搭建环境所需的软件包的整合, 不想在Linux中输指令下载的话, 可以先下载再通过Xftp传到Linux中: 
>
> [CentOS7.6从零搭建C/C++开发环境所需资源包](https://download.csdn.net/download/dxyt2002/87590116) 

以下安装软件在root用户进行

# gcc11.2.0 安装

可以先创建一个目录用来存放gcc的文件, 并进入目录: 

```shell
mkdir -p App/gcc
cd App/gcc

#--------------------------
#此时
# [root@dxyt gcc]# pwd
# /root/App/gcc
```

然后 更新、安装zlib:

```shell
yum install zlib zlib-devel
```

然后下载 gcc11.2.0的源码, 并解压: 

```shell
wget http://ftp.gnu.org/gnu/gcc/gcc-11.2.0/gcc-11.2.0.tar.gz
tar -xvf gcc-11.2.0.tar.gz
```

然后安装 gcc11.2.0的依赖: 

```shell
cd gcc-11.2.0
./contrib/download_prerequisites
```

等待依赖安装成功

然后配置编译的配置: 

```shell
# 此时
# [root@dxyt gcc-11.2.0]# pwd
# /root/App/gcc/gcc-11.2.0
# ------------------------------

mkdir build
cd build
../configure -prefix=/usr/local/gcc-11.2.0 -enable-checking=release -enable-languages=c,c++ -disable-multilib
# ------------------------------
# -prefix 设置安装路径, /usr/local/gcc-11.2.0 就可以, 所有用户都有访问权限
```

配置完成之后, 就可以编译了: 

```shell
# 此时
# [root@dxyt build]# pwd
# /root/App/gcc/gcc-11.2.0/build
# ------------------------------
make
# -----------------------------
# 不建议多线程编译, 可能会出错
# 这个过程非常的漫长, 可能需要4个小时左右, 尽量不要中断, 中断之后可能会出现链接错误
```

经过漫长的等待之后, 如果编译成功, 就可以安装了: 

```shell
make install
```

之前都没有出错的话, 这一步应该就安装成功了

## 为新版gcc创建软连接

我们老版本的gcc和g++, 在/usr/bin 路径下, 需要替换为新版本的gcc和g++

```shell
# 备份老版本gcc 和 g++
mv /usr/bin/gcc /usr/bin/gcc.bak
mv /usr/bin/g++ /usr/bin/g++.bak

# 为新版gcc 和 g++ 建立软连接
ln -s /usr/local/gcc-11.2.0/bin/gcc /usr/bin/gcc
ln -s /usr/local/gcc-11.2.0/bin/g++ /usr/bin/g++
```

然后就可以验证 gcc 和 g++的版本了: 

```shell
[root@dxyt build]# gcc -v
Using built-in specs.
COLLECT_GCC=gcc
COLLECT_LTO_WRAPPER=/usr/local/gcc-11.2.0/libexec/gcc/x86_64-pc-linux-gnu/11.2.0/lto-wrapper
Target: x86_64-pc-linux-gnu
Configured with: ../configure -prefix=/usr/local/gcc-11.2.0 --enable-checking=release --enable-languages=c,c++ --disable-multilib
Thread model: posix
Supported LTO compression algorithms: zlib
gcc version 11.2.0 (GCC) 

[root@dxyt build]# g++ -v
Using built-in specs.
COLLECT_GCC=g++
COLLECT_LTO_WRAPPER=/usr/local/gcc-11.2.0/libexec/gcc/x86_64-pc-linux-gnu/11.2.0/lto-wrapper
Target: x86_64-pc-linux-gnu
Configured with: ../configure -prefix=/usr/local/gcc-11.2.0 --enable-checking=release --enable-languages=c,c++ --disable-multilib
Thread model: posix
Supported LTO compression algorithms: zlib
gcc version 11.2.0 (GCC)
```

## 更新动态库

如果没有更新动态库, 则在使用新版gcc和g++的时候, 很可能会出错

可以先查看当前动态库的版本: 

```shell
strings /lib/x86_64-linux-gnu/libstdc++.so.6 | grep GLIBCXX
```

大概率会输出: 

```
GLIBCXX_3.4
GLIBCXX_3.4.1
GLIBCXX_3.4.2
GLIBCXX_3.4.3
GLIBCXX_3.4.4
...
GLIBCXX_3.4.19
GLIBCXX_DEBUG_MESSAGE_LENGTH
```

而 gcc11.2.0 的动态库应该是: 

```
GLIBCXX_3.4
GLIBCXX_3.4.1
GLIBCXX_3.4.2
GLIBCXX_3.4.3
GLIBCXX_3.4.4
...
GLIBCXX_3.4.27
GLIBCXX_3.4.29
GLIBCXX_DEBUG_MESSAGE_LENGTH
```

所以我们要更新一下动态库

查看新旧动态库的位置

```shell
find /usr/ -name "libstdc++.so*"
```

会列出一大堆, 其中 gcc新旧相关的是: 

```shell
/usr/lib64/libstdc++.so.6.0.19
/usr/lib64/libstdc++.so.6
……
/usr/local/gcc-11.2.0/lib64/libstdc++.so.6.0.29
/usr/local/gcc-11.2.0/lib64/libstdc++.so.6
```

我们需要将`libstdc++.so.6.0.29` 复制到 `/usr/lib64` 路径下, 并将 `/usr/lib64/libstdc++.so.6` 与其建立软连接

```shell
cp /usr/local/gcc-11.2.0/lib64/libstdc++.so.6.0.29 /usr/lib64/libstdc++.so.6.0.29
rm -f /usr/lib64/libstdc++.so.6
ln -s /usr/lib64/libstdc++.so.6.0.29 /usr/lib64/libstdc++.so.6
```

此时再查看动态库: 

```shell
strings /lib/x86_64-linux-gnu/libstdc++.so.6 | grep GLIBCXX
```

会输出: 

```
GLIBCXX_3.4
GLIBCXX_3.4.1
GLIBCXX_3.4.2
...
GLIBCXX_3.4.28
GLIBCXX_3.4.29
...
```



# cmake3.23.2 安装

博主下载的 cmake3.23.2版本, 好像不需要编译, 所以直接进入 /usr/local 路径 

```shell
cd /usr/local
wget https://github.com/Kitware/CMake/releases/download/v3.23.2/cmake-3.23.2-linux-x86_64.tar.gz
tar -zxvf cmake-3.23.2-linux-x86_64.tar.gz
mv cmake-3.23.2-linux-x86_64 cmake
```

由于不需要编译安装, 所以现在其实已经安装完成了

只需要创建软连接就可以了: 

```shell
rm -f /usr/bin/cmake
ln -s /usr/local/cmake/bin/cmake /usr/bin/cmake
```

然后就可以查看版本了: 

```shell
[root@dxyt local]# cmake --version
cmake version 3.23.2
```



# node16.19.1 安装

node16.19.1 和 npm 也不需要编译: 

```shell
cd /usr/local
wget https://nodejs.org/dist/v16.19.1/node-v16.19.1-linux-x64.tar.xz
tar -zxvf node-v16.19.1-linux-x64.tar.xz
mv node-v16.19.1-linux-x64 node
```

然后对node 和 npm 创建软连接

```shell
ln -s /usr/loacl/node/bin/node /usr/bin/node
ln -s /usr/loacl/node/bin/npm /usr/bin/npm
```

再将 node原文件所在的路径添加为PATH环境变量, 防止后边安装yarn出问题

```shell
vi /etc/profile
# 在打开文件的末尾 添加一句
export PATH=$PATH:/usr/local/node/bin
# 保存退出
source /etc/profile 	# 使更改生效
```

此时查看node和npm版本: 

```shell
[root@dxyt local]# node -v
v16.19.1
[root@dxyt local]# npm -v
9.6.2
```

> npm 版本可能与我的不同, 因为我更新了 



# python3.8.1 安装

python3.8.1的安装需要编译, 所以在还像gcc一样, 创建一个python3的存储位置

```shell
# 回到 /root
cd 
mkdir App/python3
cd App/python3
```

安装依赖环境: 

```shell
yum -y install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gdbm-devel db4-devel libpcap-devel xz-devel libffi-devel
```

下载 python3.8.1 并解压: 

```shell
wget https://www.python.org/ftp/python/3.8.1/Python-3.8.1.tar.xz
tar -xvf Python-3.8.1.tar.xz
cd Python-3.8.1
```

配置编译环境: 

```shell
./configure --prefix=/usr/local/python3
```

然后编译, 安装

```shell
make && make install
```

这个过程, 相比gcc 就要快的多了

## 为新版python3创建软连接

CentOS7.6默认的python和python2命令都是 python2.7

我们需要将 python命令改为python3.8.1, pip 和 pip3 改为新的pip

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

此时查看python 和 pip3 版本: 

```shell
[root@dxyt ~]# python
Python 3.8.1 (default, Mar 15 2023, 07:54:53) 
[GCC 11.2.0] on linux

[root@dxyt ~]# pip3 --version
pip 19.2.3 from /usr/local/python3/lib/python3.8/site-packages/pip (python 3.8)
```

## 修改 yum 配置

yum需要用到python2才能正常使用, 而yum的配置文件中默认是 python, 我们已经将python改为了python3版本, 所以需要修改一下yum的配置文件

```shell
vi /usr/bin/yum 
把 #! /usr/bin/python 修改为 #! /usr/bin/python2 
vi /usr/libexec/urlgrabber-ext-down 
把 #! /usr/bin/python 修改为 #! /usr/bin/python2
```

之后, yum就可以正常使用了

# llvm+clang12.0.0 安装

llvm和clang12.0.0 是为了 使用 Coc.nvim给C/C++语法补全用的

> 温馨提示, llvm+clang12.0.0 需要一定的内存和一定的时间
>
> 所以 内存+swap空间 至少要4G, 内存不足的话, 可以开辟一定的swap空间辅助(swap空间占用的是硬盘)
>
> 开辟swap空间: 
>
> ```shell
> free -m 		   # 查看是否有swap空间, 若存在且足够大, 则不用开辟
> dd if=/dev/zero of=/swap bs=1MB count=2048
> ll / |grep swap 	# 查看swap文件是否生成
> cd /
> mkswap swap
> swapon swap
> free -m 		   # 再查看swap空间是否开辟成功
> # bs 为单位块的大小
> # count 为需要开多少块
> # 可以根据需要修改
> # 此例中 共开辟2G
> 
> # 此次开辟的swap空间会在重启或者终端重连时 被释放, 即 此次开辟的swap空间是一次性的
> ```

> 温馨提示: llvm 和 clang的编译过程**`可能需要10小时左右`**, 且如果意外中断可能会造成连接错误
>
> 所以, 可能的话 **`尽量在网络稳定的夜晚进行, 睡前 make, 睡醒完成`**
>
> 啊哈哈哈哈哈 

首先, 还是创建存储 llvm和clang 的目录: 

```shell
cd ~/App
mkdir llvm-clang
cd llvm-clang
```

下载相关文件, 并解压, 并更改目录名: 

```shell
wget https://github.com/llvm/llvm-project/releases/download/llvmorg-12.0.0/clang-12.0.0.src.tar.xz
wget https://github.com/llvm/llvm-project/releases/download/llvmorg-12.0.0/compiler-rt-12.0.0.src.tar.xz
wget https://github.com/llvm/llvm-project/releases/download/llvmorg-12.0.0/clang-tools-extra-12.0.0.src.tar.xz
wget https://github.com/llvm/llvm-project/releases/download/llvmorg-12.0.0/llvm-12.0.0.src.tar.xz
# 下载完成之后 解压
tar -xvf clang-12.0.0.src.tar.xz
tar -xvf compiler-rt-12.0.0.src.tar.xz
tar -xvf clang-tools-extra-12.0.0.src.tar.xz
tar -xvf llvm-12.0.0.src.tar.xz
# 更改目录名
mv clang-12.0.0.src clang
mv compiler-rt-12.0.0.src compiler-rt
mv clang-tools-extra-12.0.0.src extra
mv llvm-12.0.0.src llvm-12.0.0
# 移动目录
mv clang llvm-12.0.0/tools/clang
mv compiler-rt llvm-12.0.0/projects/compiler-rt
mv extra llvm-12.0.0/tools/clang/tools/extra
# 查看当前目录内容
[root@dxyt llvm-clang]# ls
clang-12.0.0.src.tar.xz  clang-tools-extra-12.0.0.src.tar.xz  compiler-rt-12.0.0.src.tar.xz  llvm-12.0.0  llvm-12.0.0.src.tar.xz
# 只剩一个文件夹, 四个压缩文件

# 上面的步骤做完, 可以再解压一次 clang-tools-extra-12.0.0.src.tar.xz, 并修改文件名, 防止编译过程出错
tar -xvf clang-tools-extra-12.0.0.src.tar.xz
mv clang-tools-extra-12.0.0.src clang-tools-extra
```

文件的准备工作做完了, 然后配置 编译配置: 

```shell
# 先添加一个环境变量
vi /etc/profile
# 在文件末尾添加 
export CLANG_GCC=/usr/local # 然后保存退出
source /etc/profile 	# 使更改生效

# [root@dxyt llvm-clang]# pwd
# /root/App/llvm-clang
# ----------------------------
mkdir build
cd build
cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release -DCMAKE_C_COMPILER=/usr/bin/gcc -DCMAKE_CXX_COMPILER=/usr/bin/g++ -DGCC_INSTALL_PREFIX=${CLANG_GCC} -DCMAKE_CXX_LINK_FLAGS="-L${CLANG_GCC}/lib64 -Wl,-rpath,${CLANG_GCC}/lib64" -DCMAKE_INSTALL_PREFIX=${CLANG_GCC}  -DLLVM_ENABLE_ASSERTIONS=On ../llvm-12.0.0
```

配置完成之后, 就可以编译、安装了: 

```shell
# [root@dxyt llvm-clang]# pwd
# /root/App/llvm-clang/build
# ------------------------------
make
# 不建议多线程编译, 可能会出错
```

这个过程异常的漫长！异常！异常的！漫长！

建议 睡觉前, 在一个网络稳定的环境下 执行.

编译完成之后, 就可以安装了, 安装很快: 

```shell
make install
```

安装完成之后, 就安装完成了

可以查看clang 版本

```shell
[root@dxyt ~]# clang -v
clang version 12.0.0
Target: x86_64-unknown-linux-gnu
Thread model: posix
InstalledDir: /usr/local/bin
```

## 添加 C与C++ 头文件搜索目录环境变量

安装完clang, 可能会遇到cpp或c文件无法找到头文件的问题, 所以需要添加一个环境变量: 

```shell
vi /etc/profile
# 在打开的文件末尾加上
export CPLUS_INCLUDE_PATH=/usr/local/gcc-11.2.0/include/c++/11.2.0:/usr/local/gcc-11.2.0/include/c++/11.2.0/x86_64-pc-linux-gnu/
```



# neovim0.7.2 安装

neovim0.7.2不需要编译, 所以直接在/usr/local 下载文件: 

```shell
cd /usr/local
wget https://github.com/neovim/neovim/releases/download/v0.7.2/nvim-linux64.tar.gz
tar -xvf nvim-linux64.tar.gz
mv nvim-linux64 nvim
```

然后建立软连接

```shell
ln -s /usr/local/nvim/bin/nvim /usr/bin/nvim
```

此时可以查看nvim版本: 

```shell
[root@dxyt ~]# nvim -v
NVIM v0.7.2
Build type: Release
LuaJIT 2.1.0-beta3
```

## 为neovim 安装python3支持

操作很简单: 

```shell
pip3 install neovim
# 或
pip2 install neovim

# 我pip3安装出错, 暂时没探究原因
```



# gdb11.1 安装

gdb11.1 的安装是需要编译的, 所以最好先有个目录存储编译文件: 

```shell
cd ~/App
mkdir gdb
cd gdb

# ---------------------
# 此时
# [root@dxyt gdb]# pwd
# /root/App/gdb
```

然后安装依赖软件和库: 

```shell
yum install gmp gmp-devel
# -----------------------
# 博主安装时, libgmp发生了错误, 所以先检查一下gmp 和 相关库是否安装
```

准备好之后, 下载gdb11.1 源码并解压: 

```shell
wget https://ftp.gnu.org/gnu/gdb/gdb-11.1.tar.gz
tar -xvf gdb-11.1.tar.gz
cd gdb-11.1
```

然后创建build目录存储相关编译文件, 并配置编译配置: 

```shell
mkdir build
cd build
# -------------------
# 此时
# [root@dxyt build]# pwd
# /root/App/gdb/gdb-11.1/build
../configure -prefix=/usr/local/gdb11.1
```

配置完成之后, 进行编译安装: 

```shell
# 此时
# [root@dxyt build]# pwd
# /root/App/gdb/gdb-11.1/build
# -------------------------------
make && make install
```

> 如果编译出错, 可以复制错误去搜索一下哪里出错, 一般可能是依赖库的问题, 安装一下就好了
>
> 如果是跟着本篇文章安装的, 应该是不会出现gcc版本错误的

安装成功之后, 还是需要添加软连接的

```shell
ln -s /usr/local/gdb11.1/bin/gdb /usr/bin/gdb
```

创建软连接之后, 就可以使用gdb了: 

```shell
[root@dxyt ~]# gdb -v
GNU gdb (GDB) 11.1
Copyright (C) 2021 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```



# neovim开发环境配置

没有插件的neovim, 跟windows的记事本差不多, vim好用就是因为可以安装插件

**`最好在需要开发环境的用户下 配置neovim开发环境`**

> 以下配置, 我在非root用户操作

## 安装插件管理包 vim-plug

安装 vim-plug 非常的简单, 只需要在指定目录下将 git仓库中的一个文件下载下来就好了

但是需要先创建一个目录: 

```shell
cd
mkdir -p .config/nvim/autoload
cd ~/.config/nvim/autoload/
```

将远端的文件下载下来: 

```shell
# [Julyy@dxyt autoload]$ pwd
# /home/Julyy/.config/nvim/autoload
# --------------------------------------
wget https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
# 若总是连接失败, 可以直接去github上把文件内容复制下来, 然后在Linux中创建文件并将内容写入
# https://github.com/junegunn/vim-plug
```

> 下载下来之后, 可以将plug的源换一下
>
> 之前还有很多可用的github镜像, 但是现在我只知道一个: 
>
> **`hub.nuaa.cf`**
>
> 下面是换源操作
>
> ```shell
> # 打开 plug.vim
> nvim plug.vim
> # 然后将
> let fmt = get(g:, 'plug_url_format', 'https://git::@github.com/%s.git')
> # 换成
> let fmt = get(g:, 'plug_url_format', 'https://git::@hub.nuaa.cf/%s.git')
> 
> # 将
> \ '^https://git::@github\.com', 'https://github.com', '')
> # 换成
> \ '^https://git::@hub.nuaa\.cf', 'https://hub.nuaa.cf', '')
> ```

## 编辑neovim配置文件

首先要创建、打开、编辑配置文件: 

```shell
nvim ~/.config/nvim/init.vim
```

然后在文件内修改neovim的配置就可以了

这里我直接附上我自己的配置文件内容: 

```
call plug#begin('~/.config/nvim/plugged')
Plug 'neoclide/coc.nvim', {'branch': 'master'}
Plug 'mg979/vim-xtabline'
Plug 'liuchengxu/vista.vim'
Plug 'bling/vim-airline'
Plug 'majutsushi/tagbar'
"Plug 'itchyny/lightline.vim'
Plug 'ajmwagar/vim-deus'
Plug 'vim-airline/vim-airline-themes'
Plug 'jiangmiao/auto-pairs'
Plug 'octol/vim-cpp-enhanced-highlight' " C++ 高亮
call plug#end()

" 这几个是挑选的还不错的几个 airline 主题
" let g:airline_theme="ravenpower"
" let g:airline_theme="minimalist"
" let g:airline_theme="kolor"
" let g:airline_theme="jellybeans"
" let g:airline_theme="distinguished"
" let g:airline_theme="behelit"
" let g:airline_theme="tomorrow"
let g:airline_theme="biogoo"
" let g:airline_theme="deus"

set noshowmode
set relativenumber " 相对行号
set helplang=cn
set ambiwidth=double                                        
" =============== airline =================
let g:airline_powerline_fonts = 1
let g:airline#extensions#tabline#enabled = 0
let g:airline#extensions#tabline#buffer_nr_show = 1
" 关闭状态显示空白符号计数
let g:airline#extensions#whitespace#enabled = 0
let g:airline#extensions#whitespace#symbol = '!'
" unicode symbols
let g:airline_left_sep = '»'
let g:airline_left_sep = '▶'
let g:airline_right_sep = '«'
let g:airline_right_sep = '◀'
                                                            
" powerline symbols
let g:airline_left_sep = ''
let g:airline_left_alt_sep = ''
let g:airline_right_sep = ''
let g:airline_right_alt_sep = ''

" old vim-powerline symbols
let g:airline_left_sep = ''
let g:airline_left_alt_sep = ''
let g:airline_right_sep = ''
let g:airline_right_alt_sep = ''

nmap <C-z> <Cmd>:bn<CR>

" 设置UTF-8编码
set fileencodings=utf-8,ucs-bom,gb18030,gbk,gb2312,cp936
set termencoding=utf-8
set encoding=utf-8
" 设置行数显示
set number
set t_ut= " 防止vim背景颜色错误
set softtabstop=4
set t_Co=256
set tabstop=4   "tab长度
set shiftwidth=4   " 缩进长度

"===========================================
"coc.nvim 配置
"===========================================
"
" TAB选择 
" Use tab for trigger completion with characters ahead and navigate
" NOTE: There's always complete item selected by default, you may want to enable
" no select by `"suggest.noselect": true` in your configuration file
" NOTE: Use command ':verbose imap <tab>' to make sure tab is not mapped by
" other plugin before putting this into your config
inoremap <silent><expr> <TAB>
      \ coc#pum#visible() ? coc#pum#next(1) :
      \ CheckBackspace() ? "\<Tab>" :
      \ coc#refresh()
inoremap <expr><S-TAB> coc#pum#visible() ? coc#pum#prev(1) : "\<C-h>"

function! CheckBackspace() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction


" coc加载
set updatetime=100

" coc-translator

" ==================== xtabline ====================
let g:xtabline_settings = {}
let g:xtabline_settings.enable_mappings = 0
let g:xtabline_settings.tabline_modes = ['tabs', 'buffers']
let g:xtabline_settings.enable_persistance = 0
let g:xtabline_settings.last_open_first = 1
let g:xtabline_settings.theme = "tomorrow"
noremap \p :echo expand('%:p')<CR>

" =================== vim-theme ====================
"
set background=dark    " Setting dark mode
colorscheme deus
let g:deus_termcolors=256
"
"" explorer 快捷
nmap ff <Cmd>CocCommand explorer<CR>
" Close Coc-explorer if it is the only window
autocmd BufEnter * if (&ft == 'coc-explorer' && winnr("$") == 1) | q | endif

" ================ Vista =================
let g:vista_default_executive = 'ctags'

" Set the executive for some filetypes explicitly. Use the explicit executive
" instead of the default one for these filetypes when using `:Vista` without
" specifying the executive.
let g:vista_executive_for = {}

" Declare the command including the executable and options used to generate ctags output
" for some certain filetypes.The file path will be appened to your custom command.
" For example:
let g:vista_ctags_cmd = {
      \ 'haskell': 'hasktags -x -o - -c',
      \ }

" To enable fzf's preview window set g:vista_fzf_preview.
" The elements of g:vista_fzf_preview will be passed as arguments to fzf#vim#with_preview()
" For example:
let g:vista_fzf_preview = ['right:50%']
" Ensure you have installed some decent font to show these pretty symbols, then you can enable icon for the kind.
let g:vista#renderer#enable_icon = 1

" The default icons can't be suitable for all the filetypes, you can extend it as you wish.
let g:vista#renderer#icons = {
\   "function": "\uf794",
\   "variable": "\uf71b",
\  }
" 自定义tabline
set showtabline=2

" ============ tagbar ============
let g:tagbar_width=30
" 将tagbar的开关按键设置为 F4
nnoremap <silent> <F4> :TagbarToggle<CR>
" 启动 时自动focus
let g:tagbar_autofocus = 1
```

将这些内容写入到init.vim中, 并保存退出

然后再打开 init.vim, **`安装插件`**

```shell
nvim ~/.config/nvim/init.vim
# 可能会报错, 不用管他, 因为vim插件没有安装呢, 却已经写好配置了
# 安装完插件就不会报错了
# 在vim的NORMAL模式下 输入
:PlugInstall
# 等待安装成功 再
:q
:wq
# 保存退出文件
```

再打开 init.vim, 查看是否还有错误

```shell
nvim ~/.config/nvim/init.vim
# vim底行可能会有红色的提示, 提示需要 coc.nvim "yarn install" 什么的
# 然后退出
# ------------------------------------------
# 先安装 yarn
npm insrall -g yarn
cd ~/.config/nvim/plugged/coc.nvim
yarn install
# 安装成功之后 应该就不会再有错误了
```

> 若`npm install -g yarn` 安装过 yarn之后, 再使用yarn还是提示 没有找到命令
>
> 那么 回到上面 **`node16.19.1 安装`** 看一看是否添加相关的环境变量

# 结束

这一系列配置结束之后, 你就会得到一个最基本的、但挺好用的neovim的C/C++ 开发环境.

![Neovim  |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/GIF%202023-3-19%200-24-06.gif)

> 博主用的zsh, 所以可能命令行不太一样

感谢阅读！

![|tiny](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230410181851457.webp)