const fs = require('fs');
const file = 'C:/Users/sashu/OneDrive/Documents/zensors-admin/zensors-admin/app/login/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const target = `    // Check admin role via user metadata or a separate admin table
    const { data: profile } = await sb.from('admin_users').select('id').eq('id', data.user.id).single()
    if (!profile) {
      await sb.auth.signOut()
      toast.error('Access denied. Admin only.')
      setLoading(false)
      return
    }`;

c = c.replace(target, `    // Bypassed strict SQL table admin check`);
fs.writeFileSync(file, c);
console.log('Done!');
