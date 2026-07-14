import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

import_line = "import { LucideImage, LucideType, LucidePhone, LucideUpload, LucideTrash2, LucideBold, LucideItalic, LucideUnderline, LucideDownload, LucideSparkles, LucidePipette, LucideUndo2, LucideShapes, TypeIcon } from 'lucide-react';"

# Add this after import * as fabric from 'fabric';
if "lucide-react" not in text:
    text = text.replace("import * as fabric from 'fabric';", "import * as fabric from 'fabric';\n" + import_line)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated imports 2")
