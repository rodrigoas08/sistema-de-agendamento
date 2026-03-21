const fs = require('fs');
const html = fs.readFileSync('archives/barberbook-cliente.html', 'utf8');
const match = html.match(/<style>([\s\S]*?)<\/style>/);
if (match) {
    let css = match[1];
    css = css.replace(/body \{/, '.client-page {');
    css = css.replace(/header \{/, '.client-header {');
    fs.writeFileSync('components/ClientStyle.tsx', 'export const clientCss = `' + css.replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`;\n');
    console.log('CSS Extracted properly!');
}
