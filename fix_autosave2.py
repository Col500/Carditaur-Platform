import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

save_flyer_old = """      await fetch(`/api/admin/flyers/${flyer.businessId}/${flyer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      alert('Saved and approved successfully!');
      onSaved();"""

save_flyer_new = """      await fetch(`/api/admin/flyers/${flyer.businessId}/${flyer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      try {
        localStorage.removeItem('coloh_flyer_backup_' + flyer.id);
      } catch(e) {}
      alert('Saved and approved successfully!');
      onSaved();"""

text = text.replace(save_flyer_old, save_flyer_new)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated clear cache on save")
