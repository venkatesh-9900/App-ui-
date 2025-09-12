import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

/** @type {import('postcss').Plugin} */
function removeAsteriskHacks() {
  return {
    postcssPlugin: 'remove-asterisk-hacks',
    Once(root) {
      root.walkDecls(decl => {
        if (decl.prop.startsWith('*')) {
          decl.remove();
        }
      });
    },
  };
}

removeAsteriskHacks.postcss = true;

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
    removeAsteriskHacks
  ]
};