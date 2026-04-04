const fs = require('fs');

// 1. Update Types
const typeFile1 = 'C:/Users/sashu/OneDrive/Documents/zensors-admin/zensors-admin/types/index.ts';
let t1 = fs.readFileSync(typeFile1, 'utf8');
if (!t1.includes('colors: string[]')) {
  t1 = t1.replace('tags: string[]; sku: string;', 'tags: string[]; colors: string[]; sku: string;');
  fs.writeFileSync(typeFile1, t1);
}

// 2. Update Admin Post Page
const pageFile = 'C:/Users/sashu/OneDrive/Documents/zensors-admin/zensors-admin/app/products/page.tsx';
let p = fs.readFileSync(pageFile, 'utf8');

// Add colors to EMPTY
p = p.replace(
  "tags:[], is_active:true",
  "tags:[], colors:[], is_active:true"
);

// We also need to make sure 'colors' is stripped of empty strings during setEditing if it exists.
// And add the UI logic for colors.
const colorUi = `
                  {/* Colors */}
                  <div>
                    <label className="label">Colors (comma separated)</label>
                    <input value={(editing.colors||[]).join(',')} onChange={e => setEditing((p:any)=>({...p,colors:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)}))}
                      className="input" placeholder="Rose Gold, Silver, Ocean Blue"/>
                  </div>
`;

if (!p.includes('Colors (comma separated)')) {
  p = p.replace(
    "{/* Tags */}",
    colorUi + "\n                  {/* Tags */}"
  );
  fs.writeFileSync(pageFile, p);
}

console.log('Admin UI updated to support mult-colored variants!');
