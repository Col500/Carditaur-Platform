import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

import_line = "import { LucideImage, LucideType, LucidePhone, LucideUpload, LucideTrash2, LucideBold, LucideItalic, LucideUnderline, LucideDownload, LucideSparkles, LucidePipette, LucideUndo2, LucideShapes, LucideArrowLeft, LucideRedo2, LucideCheckCircle2, LucideUnlock, LucideLock, TypeIcon } from 'lucide-react';"

# Find the old import line and replace it
text = re.sub(r"import \{[^}]+\} from 'lucide-react';", import_line, text)

# Also fix <TypeIcon> to <LucideType>
text = text.replace("<TypeIcon", "<LucideType")

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Fixed imports 3")
