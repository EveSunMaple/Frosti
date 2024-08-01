document.addEventListener('astro:page-load', () => {
  const codeBlocks = document.querySelectorAll('.code')
  const toolsBlocks = document.querySelectorAll('.highlight-tools')

  codeBlocks.forEach((codeBlock, index) => {
    const toolsBlock = toolsBlocks[index]

    const container = document.createElement('div')
    container.className = 'code-container'
    container.style.position = 'relative'
    container.style.height = '24px'
    container.style.width = '24px'

    const copyButton = document.createElement('button')
    copyButton.className = 'copy'
    copyButton.title = 'Copy Button'
    copyButton.innerHTML = '<svg viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M17.676 14.248C17.676 15.8651 16.3651 17.176 14.748 17.176H7.428C5.81091 17.176 4.5 15.8651 4.5 14.248V6.928C4.5 5.31091 5.81091 4 7.428 4H14.748C16.3651 4 17.676 5.31091 17.676 6.928V14.248Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.252 20H17.572C19.1891 20 20.5 18.689 20.5 17.072V9.75195" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
    copyButton.style.border = 'none'
    copyButton.style.bottom = 0
    copyButton.style.zIndex = 100

    container.appendChild(copyButton)
    toolsBlock.appendChild(container)

    copyButton.addEventListener('click', () => {
      const code = codeBlock.textContent
      navigator.clipboard.writeText(code).then(() => {
        copyButton.innerHTML = '<svg viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.5 12.5L10.167 17L19.5 8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
        setTimeout(() => {
          copyButton.innerHTML = '<svg viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M17.676 14.248C17.676 15.8651 16.3651 17.176 14.748 17.176H7.428C5.81091 17.176 4.5 15.8651 4.5 14.248V6.928C4.5 5.31091 5.81091 4 7.428 4H14.748C16.3651 4 17.676 5.31091 17.676 6.928V14.248Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.252 20H17.572C19.1891 20 20.5 18.689 20.5 17.072V9.75195" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
        }, 1500)
      }, (err) => {
        console.error('复制失败', err)
      })
    })
  })
})
