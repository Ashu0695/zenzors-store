const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.json') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

const dirs = [
  'c:/Users/sashu/OneDrive/Documents/zensors-Store/zensors-store/zensors-store',
  'C:/Users/sashu/OneDrive/Documents/zensors-admin/zensors-admin'
];

dirs.forEach(d => {
  walk(d).forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    if (content.includes('Zensors')) {
      content = content.replace(/Zensors/g, 'Zenzors');
      changed = true;
    }
    if (content.includes('ZEN<em className="gold-text not-italic">SORS</em>')) {
      content = content.replace(/ZEN<em className="gold-text not-italic">SORS<\/em>/g, 'ZEN<em className="gold-text not-italic">ZORS</em>');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(f, content);
      console.log('Updated: ' + f);
    }
  });
});
