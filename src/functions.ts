
export function updateSvgPath(e: React.MouseEvent<SVGSVGElement>, id: string, focus: string) {
    const paint = document.getElementById(id);
    if(paint === null) return {x: 0, y: 0};
    const rect = paint.getBoundingClientRect();
  
    const target = document.getElementById(focus);
    if(target === null) return {x: 0, y: 0};
  
    const { startX, startY } = target.dataset;
  
    const a = "M" + startX + " " + startY;
    const x = e.pageX - rect.left;
    const y = e.pageY - rect.top;
    const strPath = a + " L" + (x) + " " + (y);
    // Get the smoothed part of the path that will not change
  
    target.dataset.endX = String(x);
    target.dataset.endY = String(y);
  
    target.setAttribute("d", strPath);
  
    return {
      x: x,
      y: y,
    };
  }
  
  export function getMousePosition(e: React.MouseEvent<SVGSVGElement>, id: string) {
    const paint = document.getElementById(id);
    if(paint === null) return {
        x: 0, y: 0
    };

    const rect = paint.getBoundingClientRect();
    return {
      x: e.pageX - rect.left,
      y: e.pageY - rect.top,
    };
  }
  
  export function getUUIDStr() {
    return window.crypto
    .getRandomValues(new Uint32Array(1))[0]
    .toString(36);
  }