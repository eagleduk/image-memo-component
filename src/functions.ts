
export function updateSvgPath(e: React.MouseEvent<SVGSVGElement>, id: string, focus: string) {
    const paint = document.getElementById(id);
    const rect = paint.getBoundingClientRect();
  
    const target = document.getElementById(focus);
  
    const { startX, startY } = target.dataset;
  
    const a = "M" + startX + " " + startY;
    const strPath = a + " L" + (e.pageX - rect.left) + " " + (e.pageY - rect.top);
    // Get the smoothed part of the path that will not change
  
    target.dataset.endX = e.pageX - rect.left;
    target.dataset.endY = e.pageY - rect.top;
  
    target.setAttribute("d", strPath);
  
    return {
      x: e.pageX - rect.left,
      y: e.pageY - rect.top,
    };
  }
  
  export function getMousePosition(e, id) {
    const paint = document.getElementById(id);
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