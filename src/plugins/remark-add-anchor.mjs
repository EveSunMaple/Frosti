import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

export function remarkAddAnchor() {
    return function (tree) {
        visit(tree, 'heading', (node) => {
            const textContent = toString(node);

            const slug = textContent
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-');

            if (!node.data) {
                node.data = {};
            }
            if (!node.data.hProperties) {
                node.data.hProperties = {};
            }
            node.data.hProperties.id = slug;

            const anchorHtml = {
                type: 'html',
                value: `<a href="#${slug}" class="anchor"><span class="anchor-icon" data-pagefind-ignore="">#</span></a>`,
            };

            node.children.push(anchorHtml);
        });
    };
}
