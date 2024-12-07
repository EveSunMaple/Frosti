import { visit } from 'unist-util-visit';

export function remarkAddAnchor() {
    return function (tree) {
        let headingCount = 0;
        visit(tree, 'heading', (node) => {
            headingCount++;
            const headingId = `heading-${headingCount}`;

            if (!node.data) {
                node.data = {};
            }
            if (!node.data.hProperties) {
                node.data.hProperties = {};
            }

            node.data.hProperties.id = headingId;

            // 创建锚点 HTML
            const anchorHtml = {
                type: 'html',
                value: `<a href="#${headingId}" class="anchor" aria-label="Anchor to ${node.children.map(child => child.value).join(' ')}">
                          <span class="anchor-icon" data-pagefind-ignore="" aria-hidden="true"></span>
                          <span class="sr-only">Link to ${node.children.map(child => child.value).join(' ')}</span>
                        </a>`,
            };

            // 将锚点 HTML 添加到标题节点中
            node.children.push(anchorHtml);
        });
    };
}
