import styles from "../App.module.css";

import { _DEFAULTSTATE, _TYPINGSTATE } from "../constants";

import type { _MEMOTYPE } from "../App";

export function Memo({
  id,
  memo,
  _memosRef,
  _wrapperRef,
  index,
  setFocus,
  setState,
}: {
  id: string;
  memo: _MEMOTYPE;
  _memosRef: React.RefObject<HTMLDivElement[]>;
  index: number;
  _wrapperRef: React.RefObject<HTMLDivElement | null>;
  setFocus: React.Dispatch<React.SetStateAction<string | null>>;
  setState: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const {
    id: memoId,
    top,
    left,
    innerHTML,
    width,
    height,
    color,
    fontSize,
    borderColor,
    backgroundColor,
    textAlign,
  } = memo;

  return (
    <article
      key={memoId}
      draggable
      id={memoId}
      className={styles.memo}
      data-anchor={"--" + id + "-image"}
      style={{
        top,
        left,
        width,
        height,
        color,
        fontSize,
        borderColor,
        backgroundColor,
        textAlign,
      }}
      ref={(e: HTMLDivElement) => {
        if (e) {
          _memosRef.current[index] = e;
        }
      }}
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        const { layerX, layerY } = e.nativeEvent;

        e.currentTarget?.setAttribute("layerX", String(layerX));
        e.currentTarget?.setAttribute("layerY", String(layerY));
      }}
      onDragEnd={(e: React.DragEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        if (!_wrapperRef || !_wrapperRef?.current) return;

        const { scrollTop, scrollLeft } = _wrapperRef.current;
        const { top, left } = _wrapperRef.current.getBoundingClientRect();

        const layerX = e.currentTarget.getAttribute("layerX");
        const layerY = e.currentTarget.getAttribute("layerY");

        const positionX = clientX - Number(layerX) - left + scrollLeft;
        const positionY = clientY - Number(layerY) - top + scrollTop;

        e.currentTarget.style.top = positionY + "px";
        e.currentTarget.style.left = positionX + "px";
      }}
      onDragOver={(e) => e.preventDefault()}
      onClick={(_e: React.MouseEvent) => {
        setFocus(memoId);
      }}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        onClick={(e) => {
          e.stopPropagation();
          setState(_TYPINGSTATE);
          setFocus(memoId);
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "Enter") {
            e.currentTarget.blur();
            e.currentTarget.classList.remove(styles.focus);
            setFocus(null);
            setState(_DEFAULTSTATE);
          }
        }}
      >
        {innerHTML}
      </div>
    </article>
  );
}
