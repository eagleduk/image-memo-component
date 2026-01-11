import styles from "../App.module.css";

import type { _LINETYPE } from "../App";

export default function Path({
  path,
  _linesRef,
  setFocus,
  index,
}: {
  path: _LINETYPE;
  _linesRef: React.RefObject<SVGPathElement[]>;
  setFocus: React.Dispatch<React.SetStateAction<string | null>>;
  index: number;
}) {
  const { id, fill, stroke, strokeWidth, startX, startY } = path;

  return (
    <path
      id={id}
      className={styles.path}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      ref={(e: SVGPathElement) => {
        if (e) {
          _linesRef.current[index] = e;
        }
      }}
      data-start-x={String(startX)}
      data-start-y={String(startY)}
      onClick={(_e: React.MouseEvent<SVGElement>) => {
        setFocus(id);
      }}
    ></path>
  );
}
