import { visit } from 'unist-util-visit';

export function rehypeFadeInUp() {
  return function (tree) {
    visit(tree, 'element', (node) => {
      if (!node.properties) {
        node.properties = {};
      }

      const existingClass = node.properties.className || [];

      if (!existingClass.includes('anchor-icon') && !existingClass.includes('anchor')) {
        node.properties.className = Array.isArray(existingClass)
          ? [...existingClass, 'fade-in-up']
          : ['fade-in-up'];
      }
    });
  };
}
