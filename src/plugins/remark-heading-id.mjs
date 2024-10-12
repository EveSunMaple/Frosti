import { visit } from 'unist-util-visit';

export function remarkHeadingId() {
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
        });
    };
}
