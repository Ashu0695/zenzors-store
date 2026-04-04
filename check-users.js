const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('C:/Users/sashu/OneDrive/Documents/zensors-admin/zensors-admin/.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

const supabaseAdmin = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("FAIL:", error);
    return;
  }
  console.log("TOTAL USERS:", data.users.length);
  data.users.forEach(u => {
    console.log(`- ${u.email} | Confirmed: ${!!u.email_confirmed_at}`);
  });
  
  // Try to explicitly verify admin@zenzors.in
  const u = data.users.find(x => x.email === 'admin@zenzors.in');
  if (u) {
     const { error: err2 } = await supabaseAdmin.auth.admin.updateUserById(u.id, { password: 'password123', email_confirm: true });
     if (err2) console.log("ERROR UPDATING:", err2);
     else console.log("Password reset successfully to password123");
  } else {
     const { data: nD, error: nE } = await supabaseAdmin.auth.admin.createUser({ email: 'admin@zenzors.in', password: 'password123', email_confirm: true });
     if (nE) console.log("ERROR CREATING:", nE);
     else console.log("User successfully created with password123");
  }
}

check();
