const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('C:/Users/sashu/OneDrive/Documents/zensors-admin/zensors-admin/.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

const supabaseAdmin = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const email = 'admin@zenzors.in';
  const password = 'ZenzorsAdmin123!';

  // Try to create the ultimate admin
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error && error.message.includes('already exists')) {
    // If you already made one with this email, force overwrite the password and confirmation!
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const user = list.users.find(u => u.email === email);
    if (user) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    }
  }

  // Ensure they are injected into the admin_users SQL table
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const user = list.users.find(u => u.email === email);
  if (user) {
    await supabaseAdmin.from('admin_users').insert([{ id: user.id }]).select();
  }
  console.log('SUCCESS');
}

main();
