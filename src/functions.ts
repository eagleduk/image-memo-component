export function updateSvgPath(
  e: React.MouseEvent<SVGSVGElement>,
  id: string,
  focus: string
) {
  const paint = document.getElementById(id);
  if (paint === null) return { x: 0, y: 0 };
  const rect = paint.getBoundingClientRect();

  const target = document.getElementById(focus);
  if (target === null) return { x: 0, y: 0 };

  const { startX, startY } = target.dataset;

  const a = "M" + startX + " " + startY;
  const x = e.pageX - rect.left;
  const y = e.pageY - rect.top;
  const strPath = a + " L" + x + " " + y;
  // Get the smoothed part of the path that will not change

  target.dataset.endX = String(x);
  target.dataset.endY = String(y);

  target.setAttribute("d", strPath);

  return {
    x: x,
    y: y,
  };
}

export function getMousePosition(
  e: React.MouseEvent<SVGSVGElement>,
  id: string
) {
  const paint = document.getElementById(id);
  if (paint === null)
    return {
      x: 0,
      y: 0,
    };

  const rect = paint.getBoundingClientRect();
  return {
    x: e.pageX - rect.left,
    y: e.pageY - rect.top,
  };
}

export function getUUIDStr() {
  return window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
}

export function exportMemoProperties(memo: HTMLDivElement) {
  const {
    // innerHTML,
    innerText,
    style: {
      top,
      left,
      backgroundColor = "transparent",
      color = "#000000",
      fontSize = "14px",
      width = "100px",
      height = "30px",
      borderColor = "#0000ff",
      textAlign = "center",
    },
    offsetLeft,
    offsetTop,
    offsetWidth,
    offsetHeight,
    id,
    firstChild: { innerHTML },
  } = memo;

  console.log(memo);

  return {
    id,
    top,
    left,
    borderColor,
    fontSize,
    backgroundColor,
    color,
    width,
    height,
    textAlign,
    innerHTML,
    innerText,
  };
}

export function exportPathProperties(path: SVGPathElement) {
  const {
    attributes: {
      id: { value: id },
      fill: { value: fill },
      stroke: { value: stroke },
      "stroke-width": { value: strokeWidth },
      d: { value: d },
    },
    dataset: { startX, startY, endX, endY },
  } = path;

  return {
    id,
    fill,
    stroke,
    strokeWidth,
    startX,
    startY,
    endX,
    endY,
    d,
  };
}
