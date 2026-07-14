import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    content = f.read()

# Fix duplicated colors
content = content.replace("business?.extractedColors?.slice(0, 3).map((col: string)", "Array.from(new Set(business?.extractedColors || [])).filter(c => c !== business.brandColor && c !== business.accentColor).slice(0, 3).map((col: string)")

# Fix contact info
contact_button_code = """
             <button onClick={() => {
                if (!business) return;
                const parts = [];
                if (business.phone) parts.push(`☏ ${business.phone}`);
                if (business.email) parts.push(`✉ ${business.email}`);
                if (business.instagram) parts.push(`@${business.instagram.replace('@', '')}`);
                if (business.xUsername) parts.push(`𝕏 ${business.xUsername.replace('@', '')}`);
                if (parts.length === 0) parts.push('Contact Details');
                addText(parts.join('  |  '), 'Contact Info', flyer.typography);
             }} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                    <LucidePhone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Contact</span>
             </button>
             <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
"""

# Import LucidePhone
if "LucidePhone" not in content:
    content = content.replace("LucideShapes,", "LucideShapes,\\n  LucidePhone,")

if "Contact Info" not in content:
    content = content.replace('<div className="flex items-center gap-2 px-2">', contact_button_code + "\\n             <div className=\"flex items-center gap-2 px-2\">")


with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(content)

