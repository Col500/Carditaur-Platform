import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

edit_old = """  const [editingFlyer, setEditingFlyer] = useState<any>(null);"""
edit_new = """  const [editingFlyer, setEditingFlyer] = useState<any>(null);

  useEffect(() => {
     if (flyers.length > 0) {
        const activeId = localStorage.getItem('coloh_editing_flyer_id');
        if (activeId) {
            const f = flyers.find(fl => fl.id === activeId);
            if (f) setEditingFlyer(f);
        }
     }
  }, [flyers]);"""

text = text.replace(edit_old, edit_new)

set_edit_old = """<FlyerEditor flyer={editingFlyer} onClose={() => setEditingFlyer(null)}"""
set_edit_new = """<FlyerEditor flyer={editingFlyer} onClose={() => { localStorage.removeItem('coloh_editing_flyer_id'); setEditingFlyer(null); }}"""
text = text.replace(set_edit_old, set_edit_new)

set_edit2_old = """onClick={() => setEditingFlyer(flyer)}"""
set_edit2_new = """onClick={() => { localStorage.setItem('coloh_editing_flyer_id', flyer.id); setEditingFlyer(flyer); }}"""
text = text.replace(set_edit2_old, set_edit2_new)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated session resume")
