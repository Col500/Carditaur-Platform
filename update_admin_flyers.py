import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

state_old = """  const [editingFlyer, setEditingFlyer] = useState<any>(null);"""
state_new = """  const [editingFlyer, setEditingFlyer] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadNewFlyer = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      try {
          const res = await fetch('/api/businesses');
          const data = await res.json();
          if (!data || data.length === 0) {
              alert("No businesses found");
              setIsUploading(false);
              return;
          }
          const businessId = data[0].id;
          
          const reader = new FileReader();
          reader.onload = async (f) => {
              const base64 = f.target?.result as string;
              const res2 = await fetch('/api/admin/flyers/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ imageBase64: base64, businessId, occasionName: 'Custom Upload' })
              });
              const newFlyerData = await res2.json();
              if (newFlyerData.success) {
                  await fetchFlyers();
                  localStorage.setItem('coloh_editing_flyer_id', newFlyerData.flyer.id);
                  setEditingFlyer(newFlyerData.flyer);
              }
              setIsUploading(false);
          };
          reader.readAsDataURL(file);
      } catch (err) {
          console.error(err);
          setIsUploading(false);
      }
  };"""

text = text.replace(state_old, state_new)

header_old = """        <button onClick={fetchFlyers} className="text-xs text-blue-600 underline">Refresh</button>"""
header_new = """        <div className="flex items-center gap-4">
            <label className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer font-bold">
                {isUploading ? 'Uploading...' : 'Upload Flyer'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadNewFlyer} disabled={isUploading} />
            </label>
            <button onClick={fetchFlyers} className="text-xs text-gray-500 hover:text-charcoal underline">Refresh</button>
        </div>"""

text = text.replace(header_old, header_new)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated AdminFlyers.tsx")
