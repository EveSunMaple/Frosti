// pagefind.config.js
module.exports = {
  exclude: {
    // 排除所有包含 frontmatter "draft: true" 的文件
    frontmatter: {
      draft: true
    }
  }
}