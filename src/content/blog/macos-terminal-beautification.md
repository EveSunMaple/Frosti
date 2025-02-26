## MacOS 终端美化教程

本教程将指导你如何使用开源工具和主题美化你的 Mac 终端，使其更加美观实用，并为你提供黑客帝国式的视觉体验。

**1. 前提条件**

* **确保 Shell 环境为 Zsh:** Zsh 在 macOS 上很流行，也是默认的 shell。如果之前更改为 Bash，可以使用以下命令将其改回 Zsh:
```bash
chsh -s /bin/zsh
```
* **确保安装了 Homebrew:** Homebrew 是 Mac 平台最著名的包管理器。如果没有安装，请执行以下命令：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**2. 字体安装**

我们将使用 Ubuntu Mono 字体，因为它字体清晰美观，易于阅读。

* 下载字体文件:
```bash
curl -L -o ~/Downloads/ubuntu-mono.zip "https://fonts.google.com/download?family=Ubuntu%20Mono"
```
* 解压缩字体文件:
```bash
unzip ~/Downloads/ubuntu-mono.zip -d ~/Downloads/ubuntu-mono
```
* 将字体文件移动到系统字体目录:
```bash
mv ~/Downloads/ubuntu-mono/*.ttf ~/Library/Fonts/
```
* 删除下载的字体文件和解压缩的文件夹：
```bash
rm -rf ~/Downloads/ubuntu-mono.zip ~/Downloads/ubuntu-mono
```

**3. 主题安装**

我们将使用 Snazzy 主题，它为终端带来了时尚且易于阅读的外观。

* 安装 wget (如果尚未安装):
```bash
brew install wget
```
* 下载 Snazzy 主题:
```bash
wget https://github.com/sindresorhus/terminal-snazzy/raw/main/Snazzy.terminal
```
* 双击下载的 .terminal 文件导入主题配置。
* 在终端偏好设置中，选择 Profiles 选项卡，单击 Snazzy，然后单击 Default 按钮应用主题。

**4. 功能增强**


* **安装 oh-my-zsh:**
```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

* **修改字体:** 在终端偏好设置中，选择 Profiles 选项卡，将字体设置为 Ubuntu Mono，字号设置为 18。
* **安装 Starship:**
```bash
brew install starship
echo 'eval "$(starship init zsh)"' >> ~/.zshrc
```

**5. 安装插件**

我们将会安装以下 oh-my-zsh 插件来增强终端功能:

* **autojump:** 快速跳转到之前访问过的目录。
```bash
brew install autojump
```

在 `~/.zshrc` 文件中，将以下代码添加到 plugins 列表中：

```
plugins=(
  # other plugins...
  autojump
)
```

* **zsh-syntax-highlighting:** 为代码语法添加高亮显示。

首先安装 Git:

```bash
brew install git
```

然后设置你的 Git 用户名和邮箱地址:

```bash
git config --global user.name "John Doe"
git config --global user.email johndoe@example.com
```

最后克隆 zsh-syntax-highlighting 插件并将其添加到 plugins 列表中：

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

在 `~/.zshrc` 文件中，将以下代码添加到 plugins 列表中：

```
plugins=(
  # other plugins...
  zsh-syntax-highlighting
)
```

* **zsh-autosuggestions:** 提供命令自动补全建议。

克隆 zsh-autosuggestions 插件并将其添加到 plugins 列表中:

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

在 `~/.zshrc` 文件中，将以下代码添加到 plugins 列表中：

```
plugins=(
  # other plugins...
  zsh-autosuggestions
)
```

* **Pure 提示符:**

    1. 安装 Pure:
    ```bash
    brew install pure
    ```
    2. 将 site-functions 添加到文件 $HOME/.zshrc 末尾：
    ```bash
    fpath+=("$(brew --prefix)/share/zsh/site-functions")
    ```
    3. 初始化提示符系统并选择 pure 主题作为命令提示符主题：
    ```bash
    autoload -U promptinit; promptinit
    prompt pure
    ```



**总结:**

通过以上步骤，你将拥有一个功能强大且美观的黑客帝国风格终端，提升你的工作效率和代码编写体验。