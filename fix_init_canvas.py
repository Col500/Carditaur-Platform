import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    content = f.read()

init_canvas_code = """
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    let c = new fabric.Canvas(canvasRef.current, {
       preserveObjectStacking: true,
       selection: true,
    });
    
    const init = async () => {
       const containerWidth = containerRef.current.clientWidth;
       const containerHeight = containerRef.current.clientHeight;
       
       c.setWidth(containerWidth - 40);
       c.setHeight(containerHeight - 40);
       
       if (flyer.imageUrl) {
           try {
               const res = await fetch(flyer.imageUrl);
               const blob = await res.blob();
               const objURL = URL.createObjectURL(blob);
               const img = await fabric.FabricImage.fromURL(objURL);
               
               const scaleX = c.width! / img.width!;
               const scaleY = c.height! / img.height!;
               const scale = Math.min(scaleX, scaleY);
               
               c.setWidth(img.width! * scale);
               c.setHeight(img.height! * scale);
               
               img.set({ scaleX: scale, scaleY: scale, originX: 'left', originY: 'top' });
               c.backgroundImage = img;
           } catch(e) {
               console.error('Failed to load image', e);
           }
       }
       
       c.on('selection:cleared', () => setActiveObj(null));
       c.on('selection:created', (e) => setActiveObj(e.selected?.[0] || null));
       c.on('selection:updated', (e) => setActiveObj(e.selected?.[0] || null));
       c.on('object:modified', () => saveHistory(c));
       c.on('object:added', () => saveHistory(c));
       c.on('object:removed', () => saveHistory(c));
       
       c.on('mouse:wheel', function(opt) {
          var delta = opt.e.deltaY;
          var zoom = c.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 5) zoom = 5;
          if (zoom < 0.1) zoom = 0.1;
          c.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
       });
       
       let guides: fabric.Line[] = [];
       const removeGuides = () => {
           guides.forEach(g => c.remove(g));
           guides = [];
       };
       
       c.on('object:moving', (e) => {
           const obj = e.target;
           if (!obj) return;
           
           removeGuides();
           
           const canvasWidth = c.width! / c.getZoom();
           const canvasHeight = c.height! / c.getZoom();
           const centerX = canvasWidth / 2;
           const centerY = canvasHeight / 2;
           const snapThreshold = 10;
           
           let snappedX = false;
           let snappedY = false;

           const drawGuide = (x1: number, y1: number, x2: number, y2: number) => {
               const line = new fabric.Line([x1, y1, x2, y2], {
                   stroke: 'magenta', strokeWidth: 1, selectable: false, evented: false, strokeDashArray: [5, 5]
               });
               guides.push(line);
               c.add(line);
           };

           if (Math.abs(obj.left! - centerX) < snapThreshold) {
               obj.set({ left: centerX });
               drawGuide(centerX, -1000, centerX, canvasHeight+1000);
               snappedX = true;
           }
           if (Math.abs(obj.top! - centerY) < snapThreshold) {
               obj.set({ top: centerY });
               drawGuide(-1000, centerY, canvasWidth+1000, centerY);
               snappedY = true;
           }

           const objects = c.getObjects().filter(o => o !== obj && o.type !== 'line' && o !== c.backgroundImage);
           for (const other of objects) {
               if (!snappedX && Math.abs(obj.left! - other.left!) < snapThreshold) {
                   obj.set({ left: other.left! });
                   drawGuide(other.left!, -1000, other.left!, canvasHeight+1000);
                   snappedX = true;
               }
               if (!snappedY && Math.abs(obj.top! - other.top!) < snapThreshold) {
                   obj.set({ top: other.top! });
                   drawGuide(-1000, other.top!, canvasWidth+1000, other.top!);
                   snappedY = true;
               }
           }
       });

       c.on('mouse:up', removeGuides);
       
       c.renderAll();
       setCanvas(c);
       
       // Force a timeout to initialize history after background is fully set
       setTimeout(() => {
           isHistoryUpdate.current = false;
           undoStack.current = [];
           redoStack.current = [];
           saveHistory(c);
       }, 100);
    };
    
    init();
    
    return () => {
        c.dispose();
    };
  }, [canvasRef, containerRef, flyer.imageUrl]);
"""

content = content.replace("  const addText =", init_canvas_code + "\\n  const addText =")

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(content)

