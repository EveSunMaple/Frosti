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

            const anchorHtml = {
                type: 'html',
                value: `<a href="#${headingId}" class="anchor"><span class="anchor-icon" data-pagefind-ignore=""  aria-hidden="true">#</span></a>`,
            };

            node.children.push(anchorHtml);
        });
    };
}
