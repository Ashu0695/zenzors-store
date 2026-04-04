const fs = require('fs');
const file = 'C:/Users/sashu/OneDrive/Documents/zensors-admin/zensors-admin/app/products/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  `const EMPTY: Partial<Product> = { name:'', description:'', price:0, compare_price:null, stock:0, sku:'', category_id:'', images:[], tags:[], is_active:true, is_featured:false }`,
  `const EMPTY: Partial<Product> = { name:'', description:'', price:0, compare_price:null, stock:0, sku:'', category_id:'', images:[], tags:[], is_active:true, is_featured:false }

const Field = ({ label, name, type='text', editing, setEditing, ...rest }: any) => (
  <div>
    <label className="label">{label}</label>
    <input type={type} value={(editing as any)[name]||''} onChange={e => setEditing((p: any)=>({...p,[name]:type==='number'?+e.target.value:e.target.value}))} className="input" {...rest}/>
  </div>
)`
);

c = c.replace(
`  const Field = ({ label, name, type='text', ...rest }: any) => (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={(editing as any)[name]||''} onChange={e => setEditing(p=>({...p,[name]:type==='number'?+e.target.value:e.target.value}))} className="input" {...rest}/>
    </div>
  )`,
  ``
);

c = c.replace(
`                  <Field label="Product Name *" name="name" placeholder="e.g. Aurelia Diamond Pendant"/>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Price (₹) *" name="price" type="number" placeholder="2499"/>
                    <Field label="Compare Price (₹)" name="compare_price" type="number" placeholder="4999"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Stock" name="stock" type="number" placeholder="50"/>
                    <Field label="SKU" name="sku" placeholder="ZEN-JW-001"/>
                  </div>`,
`                  <Field editing={editing} setEditing={setEditing} label="Product Name *" name="name" placeholder="e.g. Aurelia Diamond Pendant"/>
                  <div className="grid grid-cols-2 gap-4">
                    <Field editing={editing} setEditing={setEditing} label="Price (₹) *" name="price" type="number" placeholder="2499"/>
                    <Field editing={editing} setEditing={setEditing} label="Compare Price (₹)" name="compare_price" type="number" placeholder="4999"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field editing={editing} setEditing={setEditing} label="Stock" name="stock" type="number" placeholder="50"/>
                    <Field editing={editing} setEditing={setEditing} label="SKU" name="sku" placeholder="ZEN-JW-001"/>
                  </div>`
);

fs.writeFileSync(file, c);
console.log('Fixed');
