---
draft: true
title: "[Linux] 从零开始配置openEuler/EulerOS下的 C/C++开发环境: zsh安装、nvim的LSP-C/C++补全、MySQL57安装配置"
pubDate: "2024-8-8"
description: "一切, 都源于一场意外"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408091358719.webp
categories: ['tech']
tags: ["Linux使用问题", "开发", "配置", "nvim"]
---

**裂!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!**

**一个不小心`rm -rf /`了!!!!!**

**用户数据、配置全没了, 我裂了个大裂!!!!!**

既然全没了, 东西也没有很多, 不如直接重装系统, 从零开始配置一下

所以, 决定写一篇文章, 记录一下重新配置的过程/(ㄒoㄒ)/~~



---

> 以下均在`openEuler22.02 STL`环境下执行
>
> 如果是`EulerOS`, 会有很多软件已经预装好了, 已经装好的软件不用再安装, 只需要安装没有的软件就行

先不添加用户, 在`root`下配置好环境再说

# 所需软件安装

## 可以直接`dnf`命令安装的

`openEuler`的官方库维护的挺好的, 至少对国内的用户来说

本篇文章, 所配置的开发环境, 大部分所需要的软件都可以直接通过`dnf`命令安装, `most`和`nvim`除外

直接用`dnf`将大部分软件安装好

```bash
# 直接在命令行执行就好
dnf -y install g++ gdb git man-pages man-pages-help zsh wget unzip jsoncpp-devel tree

# 你也可以单独安装:
# dnf install g++: g++, openEuler默认安装有gcc, 没有g++
# dnf install gdb: gdb, 调试用
# dnf install git: git, 很重要, 后面配置 基本都要用到
# dnf install man-pages man-pages-help: man-pages 和 man-pages-help, openEuler man手册不完整, 所以需要补充完整
# dnf install zsh: zsh, 博主用的shell
# dnf install wget: wget, 获取网络资源的工具
# dnf install unzip: unzip, 后面nvim配置需要用到的解压工具
# dnf install jsoncpp-devel: jsoncpp-devel, 懂得都懂(只是一个cpp用的json包)
# dnf install tree: tree, 可以以树形结构输出目录结构
# dnf不仅会安装这些东西, 还会自动安装一些前置库等
```

还有`most`和`nvim`没有安装, 官方的`dnf`源没有`most`, `nvim`我更习惯手动安装

## `most`

`most`是一个分页工具, 我安装是为了让`man`手册有颜色, 有重点

`openEuler`的`dnf`没有`most`的下载源, 所以找一个在`rpmifnd`找了一个`rpm`:

```shell
wget https://rpmfind.net/linux/epel/8/Everything/x86_64/Packages/m/most-5.1.0-6.el8.x86_64.rpm
# 下载完之后

# 安装
sudo rpm -ivh most-5.1.0-6.el8.x86_64.rpm
```

## `nvim`

`neovim`的安装也比较方便

去`nvim`的`github`, `https://github.com/neovim/neovim/tree/master`找最新`release`下载, 或者直接执行下面的命令:

```shell
wget https://github.com/neovim/neovim/releases/download/v0.10.1/nvim-linux64.tar.gz
```

这里下载的是, 配置时的最新`release`版

```shell
# 下载完成之后 解压
tar -xvf nvim-linux64.tar.gz

# 解压完成之后, 安装一下 实际就是移到一个你了解的 软件安装路径下
# 不太了解的 就直接按照下面的命令执行, /usr/local 本来就是安装软件的地方
mv nvim-linux64 /usr/local/nvim
# 给nvim建立软连接
ln -s /usr/local/nvim/bin/nvim /usr/local/bin/nvim
```

然后, 添加`nvim`对`python3`的支持:

```shell
# 直接在命令行执行
pip3 install pynvim


# 如果提示没有pip3命令, 就需要安装pip3
# 可以先看看python3有没有安装
dnf install python3
# 再安装pip3
dnf install python3-pip
```

正常情况下, 等一会就成功安装了

# 配置软件

## `git`

设置`git`的一些`config`

```shell
# 一样的 安装完之后直接 再命令行执行就好
git config --global user.name ""
git config --global user.email ""
git config --global core.editor nvim

# 生成ssh密钥和公钥 为了在有用的地方使用
ssh-keygen -t rsa -b 4096 -C "email"
```

除了设置`user.name`和`user.email`之外, 还要设置一下`git`默认的编辑工具

因为我个人用的`neovim`, 所以设置为`nvim`

## `zsh`

已经安装了`zsh`, 就可以改用户的`shell`:

```bash
# openEuler
chsh -s /bin/zsh username

# EulerOS, 应该是没有chsh
usermode -s /bin/zsh username
```

安装`oh-my-zsh`和`p10k`, 强化一下`zsh`:

```shell
# 直接在命令行执行
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 上面的命令成功之后, 再执行下面的命令
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 两条指令都成功之后, 打开 ~/.zshrc
vim ~/.zshrc
# 找到 ZSH_THEME的一行, 改成下面的的内容
ZSH_THEME="powerlevel10k/powerlevel10k"
# 然后输入 :wq 回车, 保存退出
# 再在命令行执行
source ~/.zshrc
```

完成之后, 按照引导 和 喜好配置`p10k`就可以了

我个人配置完之后, 是这样的:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240809125029682.webp)

然后安装`oh-my-zsh`, 我个人认为最重要的两个插件:

```shell
# 一句一句在命令行执行
git clone https://github.com/zsh-users/zsh-autosuggestions.git $ZSH_CUSTOM/plugins/zsh-autosuggestions

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting
```

两个插件都`git clone`之后, 可以在`~/.oh-my-zsh/custom/plugins`路径下查看他们

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408091253714.webp)

然后`nvim ~/.zshrc`, 找到`plugins=(git)`的一行

在其中添加`zsh-autosuggestions` 和 `zsh-syntax-highlighting`:

`plugins=(git zsh-autosuggestions zsh-syntax-highlighting)`

保存退出

在命令行执行`source ~/.zshrc`, 常用项配置结束

---

下面是博主个人习惯在`~/.zshrc`中添加的配置:

```shell
# 防止 rm 直接将文件删掉, 所以将 rm定义成一个函数, 起到 mv -t 的作用
rm() {
    if [[ $1 == "-rf" ]]; then
        shift
        mv -t ~/.delete/. "$@"
    else
        mv -t ~/.delete/. "$@"
    fi

    echo "成功将文件移动到 ~/.delete, 请注意清理"
}
# 方便打开多个文件, 一起加载到nvim的bufferline插件里
alias nvim="nvim -p"
alias vim="nvim -p"
# cat, t 太远了, 而且 cat查看文件内容默认的Tab长度是8, 这里改成cas 并以Tab 为4查看
alias cas="expand -t 4 | cat"
# 下面是 pigcha jia速qi 的配置
alias pig="pigchacli"
alias unsetpig="unset https_proxy http_proxy && git config --global --unset https.proxy && git config --global --unset http.proxy"
alias setpig="export https_proxy=http://127.0.0.1:15777 http_proxy=http://127.0.0.1:15777 && git config --global http.proxy http://127.0.0.1:15777 && git config --global https.proxy http://127.0.0.1:15777"
```

>因为在`.zshrc`中, 把`rm`定义成了一个函数
>
>所以, 原本的`rm`就没有办法正常执行了
>
>所以, 要给原本的`rm`建立一个软连接
>
>在命令行执行:
>
>`ln -s /usr/bin/rm /usr/bin/rlrm`
>
>之后, 执行`rlrm(realrm)`就是原本的`rm`

## `man`

`openEuler`有`man`但是看不了, 所以在上面安装了`man-pages` `man-pages-help`

但是这样的`man`只是黑白的, 所以还安装了`most`分页工具



然后在`~/.zshrc`中添加环境变量: `export PAGER=most`

之后再用`man`就可以看到彩色的了, 虽然也并不是很彩, 但至少是有重点了:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240809124502717.webp)

## `neovim`

`neovim`的配置比较方便, 因为博主自己有自用的配置在`github`中

---

不同用户, 软件的配置是不互通的

所以, 此时在`root`用户下配置, 之后创建新用户需要重新配置, `nvim`和`zsh`都是如此

进入`~/.config`, 如果没有可以创建一个:

```shell
# 如果没有, 就先执行这个
mkdir ~/.config

# 然后
cd ~/.config

# 然后, 把github上的nvim配置clone下来
git clone https://github.com/humid1ch/nvim.git

# 或者可以登录网页, 直接赋值init.lua的内容
# 在 ~/.config 下创建一个 nvim目录
# 再在 nvim目录下创建一个init.lua, 把内容复制进去就可以了
```

有了`init.lua`配置文件之后, 再打开`nvim` 就会自动下载、安装、配置`nvim`

这个过程最好要保证 **"相信科学, 网络通畅"**

不然, 很可能某些插件会安装失败, 不过安装失败也不要紧

如果某些插件安装失败了, 可以打开`nvim`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408091330673.webp)

`command`模式下输入`:Lazy`回车, 就会打开插件的配置界面:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408091331549.webp)

你可以按`S`对所有插件重新刷新, 安装

直到所有插件完整的安装完毕

---

然后就可以安装`lsp`了

依旧是在`command`模式下:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408091336869.webp)

博主只需要使用`C/C++`的相关功能, 所以就安装`clangd`和`clang-format`了

`:MasonInstall lua-language-server clangd clang-format`回车 **(在之后加`@`可以选择版本)**

等待安装完成之后, `nvim`就可以实现`C/C++`的补全了:

![这里边都是各种语言的LSP](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408091336654.webp)

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408091338628.webp)

愉快 愉快~

## `gdb`

`gdb`是用来调试`C/C++`程序的, 不过在实际调试时, 会出现一些提示, 说调试信息缺失什么的

然后会有一句提示大概是:

```shell
dnf debuginfo-install libgcc-xxxxxxx.x86_64 libstdc++-xxxxxxx.x86_64
```

是让你安装`gcc/g++`对应版本的一些`gdb`需要的调试信息的

所以直接复制提示的版本安装就可以了:

```shell
dnf debuginfo-install libgcc-xxxxxxx.x86_64 libstdc++-xxxxxxx.x86_64

# EulerOS 可能会关闭dnf或yum的 debuginfo
# 所以需要手动打开, 然后再安装
# 这里以openEuler22.03 STL为演示打开yum的debufinfo, 然后在使用yum安装对应的调试信息
cd /etc/yum.repos.d
# 然后编辑里边的文件
vim xxxxxx.conf
# 找到 [debuginfo]
# 将所属的enable=0, 改成enable=1
enable=1
# :wq写入退出

# 然后使用yum安装就可以了
yum debuginfo-install libgcc-xxxxxxx.x86_64 libstdc++-xxxxxxx.x86_64
```

**这里需要`libgcc`和`libstdc++`都要安装, 不然`nvim-lsp`会出现`bug`, 无法对其中一种语言实现补全**

大功告成~

# `MySQL57` 的安装

安装`MySQL5.7`:

```shell
# EulerOS 默认是不安装MySQL的
# dnf和yum默认安装的不是5.7
# 所以要添加源

# 下载源
wget https://repo.mysql.com/mysql57-community-release-el7.rpm
# 导入源
rpm -Uvh mysql57-community-release-el7.rpm
# 查看源
yum list |grep mysql
# 导入2022密钥 就得是2022的, 新的不行 旧的也不行
rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
# 最好在 /etc/yum.repos.d/mysql-community.repo 文件的 mysql57-community 的 gpgkey也设置一下
gpgkey=https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
# 安装mysql57
yum install -y mysql-community-server
# 等待完成就可以了

# 还要安装一下 mysql57的C语言开发库
yum install mariadb-devel
# 一般上边的源配置好之后 此时就是 mysql57的库
```

安装`MySQL`之后, 还要配置一下`/etc/my.cnf`

```cnf
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html

# 新增
[mysql]
default-character-set=utf8

[mysqld]
#
# Remove leading # and set to the amount of RAM for the most important data
# cache in MySQL. Start at 70% of total RAM for dedicated server, else 10%.
# innodb_buffer_pool_size = 128M
#
# Remove leading # to turn on a very important data integrity option: logging
# changes to the binary log between backups.
# log_bin
#
# Remove leading # to set options mainly useful for reporting servers.
# The server defaults are faster for transactions and fast SELECTs.
# Adjust sizes as needed, experiment to find the optimal values.
# join_buffer_size = 128M
# sort_buffer_size = 2M
# read_rnd_buffer_size = 2M
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock

# 新增
default-storage-engine=innodb
character_set_server=utf8
collation-server = utf8_general_ci
sql-mode = TRADITIONAL
init-connect = 'SET NAMES utf8'

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0

log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid
```

然后启动`mysql`:

`systemctl start mysqld`

启动之后, 先获取临时密码, 然后登录:

```shell
grep 'temporary password' /var/log/mysqld.log
# 输出 A temporary password is generated for root@localhost: xxxxxxxxx
# 然后登录
mysql -uroot -p
# 输入 刚刚输出在屏上的密码
```

登录之后, 需要修改密码, 才能执行命令:

```mysql
SET PASSWORD = PASSWORD("new password");
# new password 改成 想要设置的密码就好了
```

还可以设置开机自启:

```shell
systemctl enable mysqld
systemctl daemon-reload
```

# 添加用户

```shell
# 添加用户, 并同时创建用户目录
useradd -m username

# 将用户添加到wheel组
usermod -a -G wheel username
# 执行之后, user就至少有了两个用户组: username和wheel

# 添加新用户的 sudo权限
nvim /etc/sudoers
# 在 root	ALL=(ALL)	ALL 下一行
# 添加 username	ALL=(ALL)	ALL

# 然后给用户设置新密码
passwd username

# 再更改新用户的shell 为 zsh
usermode -s /bin/zsh username
# 通过openEuler的dnf安装的zsh应该就在/bin/zsh下
# 否则你可以查看 /etc/shells 的内容, 找一下zsh
```

---

然后就可以用新用户登录系统了

然后可以重新参考上面的`配置zsh`和`配置nvim`将两个软件配置一下

不用再安装`zsh`和`nvim`, 因为已经安装过了

只需要配置一下
