const fs = require('fs');
const file = 'C:/Users/sashu/OneDrive/Documents/zensors-admin/zensors-admin/app/products/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  `const payload = { ...editing, slug: slugify(editing.name!), updated_at: new Date().toISOString() }`,
  `const payload = { ...editing, slug: slugify(editing.name!), updated_at: new Date().toISOString() }; delete (payload as any).category;`
);

fs.writeFileSync(file, c);
console.log('Fixed category payload bug');
