import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_add = """  const addShape = (type: string) => {
    if (!canvas) return;
    let shape;
    const center = { left: canvas.width! / canvas.getZoom() / 2, top: canvas.height! / canvas.getZoom() / 2 };
    
    if (type === 'circle') {
        shape = new fabric.Circle({ radius: 50, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'rectangle') {
        shape = new fabric.Rect({ width: 100, height: 100, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'triangle') {
        shape = new fabric.Triangle({ width: 100, height: 100, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'star') {
        const starPoints = [
            {x: 50, y: 0}, {x: 61, y: 35}, {x: 98, y: 35}, {x: 68, y: 57},
            {x: 79, y: 91}, {x: 50, y: 70}, {x: 21, y: 91}, {x: 32, y: 57},
            {x: 2, y: 35}, {x: 39, y: 35}
        ];
        shape = new fabric.Polygon(starPoints, { fill: '#F5A623', originX: 'center', originY: 'center', ...center });
    } else if (type === 'glitter') {
        shape = new fabric.Textbox('✦', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#F5A623', fontFamily: 'Arial' });
    } else if (type === 'confetti') {
        shape = new fabric.Textbox('✺', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#E52B50', fontFamily: 'Arial' });
    }
    
    if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        saveHistory(canvas);
    }
  };"""

new_add = """  const addShape = (type: string, outlined = false) => {
    if (!canvas) return;
    let shape: fabric.Object | null = null;
    const center = { left: canvas.width! / canvas.getZoom() / 2, top: canvas.height! / canvas.getZoom() / 2 };
    
    const fill = outlined ? 'transparent' : '#1E824C';
    const stroke = outlined ? '#1E824C' : undefined;
    const strokeWidth = outlined ? 4 : 0;
    
    if (type === 'circle') {
        shape = new fabric.Circle({ radius: 50, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'rectangle') {
        shape = new fabric.Rect({ width: 100, height: 100, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'triangle') {
        shape = new fabric.Triangle({ width: 100, height: 100, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'star') {
        const starPoints = [
            {x: 50, y: 0}, {x: 61, y: 35}, {x: 98, y: 35}, {x: 68, y: 57},
            {x: 79, y: 91}, {x: 50, y: 70}, {x: 21, y: 91}, {x: 32, y: 57},
            {x: 2, y: 35}, {x: 39, y: 35}
        ];
        shape = new fabric.Polygon(starPoints, { fill: outlined ? 'transparent' : '#F5A623', stroke: outlined ? '#F5A623' : undefined, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'glitter') {
        shape = new fabric.Textbox('✦', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#F5A623', stroke: outlined ? '#F5A623' : undefined, strokeWidth: outlined ? 2 : 0, fontFamily: 'Arial' });
    } else if (type === 'confetti') {
        shape = new fabric.Textbox('✺', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#E52B50', fontFamily: 'Arial' });
    }
    
    if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        saveHistory(canvas);
    }
  };"""

text = text.replace(old_add, new_add)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated addShape")
