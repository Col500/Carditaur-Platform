import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_imp = "import { LucideImage, LucideType, LucidePhone, LucideUpload, LucideTrash2, LucideBold, LucideItalic, LucideUnderline, LucideDownload, LucideSparkles, LucidePipette, LucideUndo2, LucideShapes, LucideArrowLeft, LucideRedo2, LucideCheckCircle2, LucideUnlock, LucideLock, TypeIcon } from 'lucide-react';"
new_imp = "import { LucideImage, LucideType, LucidePhone, LucideUpload, LucideTrash2, LucideBold, LucideItalic, LucideUnderline, LucideDownload, LucideSparkles, LucidePipette, LucideUndo2, LucideShapes, LucideArrowLeft, LucideRedo2, LucideCheckCircle2, LucideUnlock, LucideLock, TypeIcon, LucidePanelTop, LucidePanelBottom, LucidePanelLeft, LucidePanelRight, LucideBan, LucideMaximize } from 'lucide-react';"

text = text.replace(old_imp, new_imp)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated imports")
