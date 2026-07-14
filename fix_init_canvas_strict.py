import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# Find the start and end of the useEffect containing init()
start_marker = "  useEffect(() => {\n    if (!canvasRef.current || !containerRef.current) return;"
end_marker = "  }, [canvasRef, containerRef, flyer.imageUrl]);"

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    old_code = text[start_idx:end_idx + len(end_marker)]
    new_code = """  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    let isMounted = true;
    let c = new fabric.Canvas(canvasRef.current, {
       preserveObjectStacking: true,
       selection: true,
    });
    
    const init = async () => {
       const containerWidth = containerRef.current.clientWidth;
       const containerHeight = containerRef.current.clientHeight;
       
       c.setDimensions({ width: containerWidth - 40, height: containerHeight - 40 });
       
       if (flyer.imageUrl) {
           try {
               const img = await fabric.FabricImage.fromURL(flyer.imageUrl, { crossOrigin: 'anonymous' });
               if (!isMounted) return;
               
               const scaleX = c.width! / img.width!;
               const scaleY = c.height! / img.height!;
               const scale = Math.min(scaleX, scaleY);
               
               c.setDimensions({ width: img.width! * scale, height: img.height! * scale });
               
               img.set({ scaleX: scale, scaleY: scale, originX: 'left', originY: 'top' });
               c.backgroundImage = img;
           } catch(e) {
               console.error('Failed to load image', e);
           }
       }
       
       if (!isMounted) return;
       
       c.on('selection:cleared', () => setActiveObj(null));
       c.on('selection:created', (e) => setActiveObj(e.selected?.[0] || null));
       c.on('selection:updated', (e) => setActiveObj(e.selected?.[0] || null));
       c.on('object:modified', () => saveHistory(c));
       c.on('object:added', () => saveHistory(c));
       c.on('object:removed', () => saveHistory(c));
       
       // Zoom and pan logic
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

       // Enable panning with alt+drag or middle mouse button
       c.on('mouse:down', function(opt) {
          var evt = opt.e;
          if (evt.altKey === true || evt.button === 1) {
             this.isDragging = true;
             this.selection = false;
             this.lastPosX = evt.clientX;
             this.lastPosY = evt.clientY;
          }
       });
       c.on('mouse:move', function(opt) {
          if (this.isDragging) {
             var e = opt.e;
             var vpt = this.viewportTransform;
             vpt[4] += e.clientX - this.lastPosX;
             vpt[5] += e.clientY - this.lastPosY;
             this.requestRenderAll();
             this.lastPosX = e.clientX;
             this.lastPosY = e.clientY;
          }
       });
       c.on('mouse:up', function(opt) {
          this.setViewportTransform(this.viewportTransform);
          this.isDragging = false;
          this.selection = true;
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
       
       setTimeout(() => {
           if (!isMounted) return;
           isHistoryUpdate.current = false;
           undoStack.current = [];
           redoStack.current = [];
           saveHistory(c);
       }, 100);
    };
    
    init();
    
    return () => {
        isMounted = false;
        c.dispose();
    };
  }, [canvasRef, containerRef, flyer.imageUrl]);"""
    text = text.replace(old_code, new_code)
    with open('src/components/AdminFlyers.tsx', 'w') as f:
        f.write(text)
    print("Replaced successfully")
else:
    print("Could not find block")
