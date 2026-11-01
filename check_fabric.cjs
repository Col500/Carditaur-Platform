import * as fabric from 'fabric';
console.log(Object.keys(fabric.Canvas.prototype).filter(k => k.toLowerCase().includes('back') || k.toLowerCase().includes('move') || k.toLowerCase().includes('send')));
