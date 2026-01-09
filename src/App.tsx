import styles from "./App.module.css";

import { useEffect, useId, useRef, useState } from "react";

import {
  _READYSTATE,
  _DEFAULTSTATE,
  _TEXTSTATE,
  _TYPINGSTATE,
  _LINESTATE,
  _DRAWINGSTATE,
  _CREATE,
  _DELETE,
} from "./constants";

import { getMousePosition, getUUIDStr, updateSvgPath } from "./functions";

type _MEMOTYPE = {
  id: string;
  top: string;
  left: string;
  text: null | string;
};

type _LINETYPE = {
  id: string;
  style: React.CSSProperties;
  startX: number;
  startY: number;
};

type _TIMELINETYPE = { type: number; target: string; element: HTMLElement };

function App() {
  const id = useId();

  const _wrapperRef = useRef<HTMLDivElement>(null);
  const _svgRef = useRef<SVGSVGElement>(null);
  const _imageRef = useRef<HTMLImageElement>(null);
  const _addLineBtnRef = useRef<HTMLButtonElement>(null);
  const _addTextAreaBtnRef = useRef<HTMLButtonElement>(null);
  const _fileInputRef = useRef<HTMLInputElement>(null);
  const _memosRef = useRef<HTMLDivElement[]>([]);
  const _linesRef = useRef<SVGPathElement[]>([]);

  const [memos, setMemos] = useState<_MEMOTYPE[]>([]);
  const [paths, setPaths] = useState<_LINETYPE[]>([]);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    if (focus === null) {
      _memosRef.current.forEach((_memo) => {
        _memo.classList.remove(styles.focus);
        _memo.querySelector("div")?.blur();
      });

      _linesRef.current.forEach((_lineRef) => {
        _lineRef.classList.remove(styles.focus);
      });
      return;
    }
    document.getElementById(focus)?.classList.add(styles.focus);
  }, [focus]);

  const [state, setState] = useState<null | number>(_READYSTATE);

  const [prevState, setPrevState] = useState<_TIMELINETYPE[]>([]);
  const [nextState, setNextState] = useState<_TIMELINETYPE[]>([]);

  function stateBtnEnabled() {
    textStateEnabled();
    lineStateEnabled();
  }

  function textStateEnabled() {
    if (_addTextAreaBtnRef.current) {
      _addTextAreaBtnRef.current.classList.remove("active");
      _addTextAreaBtnRef.current.removeAttribute("disabled");
    }
  }

  function textStateDisabled() {
    if (_addTextAreaBtnRef.current) {
      _addTextAreaBtnRef.current.classList.add("active");
      _addTextAreaBtnRef.current.setAttribute("disabled", "true");
    }
  }

  function lineStateEnabled() {
    if (_addLineBtnRef.current) {
      _addLineBtnRef.current.classList.remove("active");
      _addLineBtnRef.current.removeAttribute("disabled");
    }
  }

  function lineStateDisabled() {
    if (_addLineBtnRef.current) {
      _addLineBtnRef.current.classList.add("active");
      _addLineBtnRef.current.setAttribute("disabled", "true");
    }
  }

  function addTimeLine({
    type,
    element,
  }: {
    type: typeof _CREATE | typeof _DELETE;
    element: HTMLElement;
  }) {
    setPrevState((p) => [...p, { type, target: element.id, element }]);
    setNextState([]);
  }

  function createMemo(text = null, { x = 0, y = 0 }) {
    const uuidStr = getUUIDStr();

    const memoId = id + "_memo_" + uuidStr;

    const memo = {
      id: memoId,
      top: (text === null ? y - 15 : y) + "px",
      left: (text === null ? x - 50 : x) + "px",
      text,
    };

    setMemos((m) => [...m, memo]);

    addTimeLine({ type: _CREATE, element: memo });
    return memo;
  }

  function createPath(
    e: React.MouseEvent<SVGSVGElement>,
    { fill = "none", stroke = "#000000", strokeWidth = 3 }
  ) {
    const uuidStr = getUUIDStr();
    const pathId = id + "_path_" + uuidStr;

    const pt = getMousePosition(e, id + "_paint");

    const path = {
      id: pathId,
      style: {
        fill,
        stroke,
        strokeWidth,
      },
      startX: pt.x,
      startY: pt.y,
    };

    setState(_DRAWINGSTATE);
    setFocus(path.id);
    setPaths((p) => [...p, path]);

    addTimeLine({ type: _CREATE, element: path });

    return path;
  }

  function changeImageFile(files: FileList | null) {
    if (_fileInputRef.current) {
      _fileInputRef.current.files = files;

      const uploadFile = files;

      setMemos([]);
      setPaths([]);

      setFocus(null);
      setState(_READYSTATE);

      setPrevState([]);
      setNextState([]);

      _memosRef.current = [];
      _linesRef.current = [];

      if (!uploadFile || uploadFile?.length === 0) {
        if (!_imageRef.current) return;
        _imageRef.current.src = "";
        return;
      }

      const base64 = new Blob([uploadFile[0]], {
        type: uploadFile[0].type,
      });

      const url = window.URL.createObjectURL(base64);

      if (_imageRef.current) _imageRef.current.src = url;
    }
  }

  function onSave() {
    console.log(_memosRef, _linesRef);
    const memos = _memosRef.current.map((memo) => {
      const {
        innerHTML,
        innerText,
        style: {
          top,
          left,
          backgroundColor,
          color,
          fontSize,
          width,
          height,
          borderColor,
          textAlign,
        },
        offsetLeft,
        offsetTop,
        offsetWidth,
        offsetHeight,
        id,
      } = memo;
      return {
        innerHTML,
        offsetLeft,
        offsetTop,
        offsetWidth,
        offsetHeight,
        backgroundColor,
        color,
        id,
        fontSize,
        // width,
        // height,
        borderColor,
        innerText,
        textAlign,
        // top,
        // left,
      };
    });

    const lines = _linesRef.current.map((path) => {
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
    });

    console.log("memos :: ", memos);
    console.log("lines :: ", lines);
  }

  return (
    <div
      id={id}
      className={styles.content}
      tabIndex={0} // Add this line
      onClick={(e) => {
        const element = e.target as HTMLElement;
        console.log("CLICK :::: ", state);
        console.dir(element);
        if (state === _READYSTATE || state === _LINESTATE) return;

        if (
          element.nodeName === "ARTICLE" ||
          (element.nodeName === "INPUT" &&
            (element as HTMLInputElement).type === "color") ||
          (element.nodeName === "INPUT" &&
            (element as HTMLInputElement).type === "number") ||
          element.nodeName === "path"
        ) {
          return;
        }

        setFocus(null);
      }}
      onKeyDown={(e) => {
        console.log("onKeyDown ", e);
        if (e.code === "Escape") {
          setState(_DEFAULTSTATE);
          setFocus(null);
        } else if (e.code === "Delete") {
          if (state === _TYPINGSTATE) {
            return;
          }
          if (focus) {
            // TODO: 텍스트 입력중 바로 삭제해버림. 입력중 상태라도 필요할 듯
            const element = document.getElementById(focus);
            addTimeLine({ type: _DELETE, element: element });
            // element.remove();
            setFocus(null);
          }
        }
        // TODO: 되돌리기 실행취소 테스트
        if (e.ctrlKey && e.code === "KeyZ") {
          if (focus !== null) return;

          if (prevState.length === 0) return;

          const latest = prevState.pop();

          if (!latest) return;

          setPrevState((p) => {
            // p.pop();
            return prevState;
          });

          setNextState((p) => [...p, latest]);

          if (latest.type === _CREATE) {
            const element = document.getElementById(latest.target);
            // if(element)
            // element.remove();

            // const element = latest.element;
            if (element === null) return;

            if (element.nodeName === "ARTICLE") {
              setMemos((memo) => memo.filter(({ id }) => id !== latest.target));
            }

            if (element.nodeName === "path") {
              // _wrapperRef.current?.appendChild(element);
              setPaths((path) => path.filter(({ id }) => id !== latest.target));
            }
          } else if (latest.type === _DELETE) {
            const element = latest.element;

            if (element.nodeName === "ARTICLE") {
              _wrapperRef.current?.appendChild(element);
            }

            if (element.nodeName === "path") {
              _wrapperRef.current?.appendChild(element);
            }
          }
        }
        if (e.ctrlKey && e.code === "KeyY") {
          console.log("되돌리기");
          if (focus !== null) return;

          if (nextState.length === 0) return;

          const latest = nextState.pop();

          if (!latest) return;

          setNextState((p) => {
            return nextState;
          });

          setPrevState((p) => [...p, latest]);

          if (latest.type === _CREATE) {
            const element = document.getElementById(latest.target);

            if (!element) return;

            if (element.nodeName === "ARTICLE") {
              // _wrapperRef.current?.appendChild(element);
              setMemos((memo) => [...memo, latest.element]);
            }

            if (element.nodeName === "path") {
              // _svgRef.current?.appendChild(element);
              setPaths((path) => [...path, latest.element]);
            }
          } else if (latest.type === _DELETE) {
            const element = document.getElementById(latest.target);
            element?.remove();
          }
        }

        if (e.code === "KeyL") {
          console.log("라인 그리기");
          if (focus !== null) return;
          _addLineBtnRef.current?.click();
        }
        if (e.code === "KeyT") {
          console.log("TextArea 그리기");
          if (focus !== null) return;
          _addTextAreaBtnRef.current?.click();
        }
      }}
      onPaste={(e) => changeImageFile(e.clipboardData.files)}
    >
      <div className={styles.toolbar}>
        <input
          type="file"
          id={id + "_file_input"}
          ref={_fileInputRef}
          accept="image/*"
          onInput={(e) => console.log(e)}
          onChange={(e) => changeImageFile(e.currentTarget.files)}
        />

        <button onClick={onSave}>SAVE</button>

        <button
          id={id + "_textArea_btn"}
          ref={_addTextAreaBtnRef}
          onClick={(_: React.MouseEvent) => {
            if (state === _READYSTATE) return;
            textStateEnabled();
            lineStateEnabled();

            setState(_TEXTSTATE);
            textStateDisabled();
          }}
        >
          [ T ]
        </button>
        <button
          id={id + "_line_btn"}
          ref={_addLineBtnRef}
          onClick={(_e: React.MouseEvent) => {
            if (state === _READYSTATE) return;
            setState(_LINESTATE);
            lineStateDisabled();
          }}
        >
          [ L ]
        </button>

        <input
          type="color"
          id={id + "_text_color_picker"}
          onChange={(e) => {
            if (!focus) return;

            const element = document.getElementById(focus);
            if (element && element.nodeName === "ARTICLE") {
              element.style.color = e.currentTarget.value;
            }
          }}
        />
        <input
          type="number"
          id={id + "_text_size_picker"}
          onChange={(e) => {
            if (!focus) return;

            const element = document.getElementById(focus);
            if (element && element.nodeName === "ARTICLE") {
              element.style.fontSize = e.currentTarget.value + "px";
            }
          }}
        />
        <input
          type="color"
          id={id + "_border_color_picker"}
          onChange={(e) => {
            if (!focus) return;
            const element = document.getElementById(focus);
            if (element && element.nodeName === "ARTICLE") {
              element.style.borderColor = e.target.value;
            } else if (element && element.nodeName === "path") {
              element.setAttribute("stroke", e.currentTarget.value);
            }
          }}
        />
      </div>

      <div className={styles.memo_content}>
        <div
          className={styles.image_wrapper}
          id={id + "_image_wrapper"}
          ref={_wrapperRef}
        >
          <svg
            id={id + "_paint"}
            className={styles.image_paint}
            data-target-anchor={"--" + id + "_image"}
            ref={_svgRef}
            onContextMenu={(e) => {
              if (state === _DRAWINGSTATE) {
                e.preventDefault();
                setState(_DEFAULTSTATE);
                stateBtnEnabled();

                setPrevState((c) => {
                  return c.slice(0, -1);
                });

                setPaths((p) => {
                  return p.slice(0, -1);
                });

                _linesRef.current = [];
              }
            }}
            onClick={(e: React.MouseEvent<SVGSVGElement>) => {
              if (state === _TEXTSTATE) {
                const rect = _svgRef.current?.getBoundingClientRect();

                if (!rect) return;

                const memo = createMemo(null, {
                  x: e.pageX - rect.left,
                  y: e.pageY - rect.top,
                });

                setState(_DEFAULTSTATE);
                stateBtnEnabled();
              } else if (state === _LINESTATE) {
                const path = createPath(e, {});

                setState(_DRAWINGSTATE);
                setFocus(path.id);
              } else if (state === _DRAWINGSTATE) {
                if (focus === null) return;

                updateSvgPath(e, id + "_paint", focus);

                const path = createPath(e, {});

                setState(_DRAWINGSTATE);
                setFocus(path.id);
              }
            }}
            onMouseMove={(e: React.MouseEvent<SVGSVGElement>) => {
              if (focus === null) return;
              if (state === _DRAWINGSTATE) {
                updateSvgPath(e, id + "_paint", focus);
              }
            }}
          >
            {paths.map(({ id, style, startX, startY }, index) => {
              return (
                <path
                  key={id}
                  id={id}
                  className={styles.path}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  fill={style.fill}
                  ref={(e: SVGPathElement) => {
                    if (e) {
                      _linesRef.current[index] = e;
                    }
                  }}
                  data-start-x={String(startX)}
                  data-start-y={String(startY)}
                  onClick={(_e: React.MouseEvent<SVGElement>) => {
                    _linesRef.current.forEach((_lineRef) =>
                      _lineRef.classList.remove(styles.focus)
                    );
                    setFocus(id);
                  }}
                ></path>
              );
            })}
          </svg>

          <img
            style={{
              anchorName: "--" + id + "_image",
            }}
            id={id + "_image"}
            ref={_imageRef}
            onLoad={(e) => {
              _svgRef.current?.setAttribute(
                "width",
                e.currentTarget.clientWidth.toString()
              );
              _svgRef.current?.setAttribute(
                "height",
                e.currentTarget.clientHeight.toString()
              );

              setState(_DEFAULTSTATE);
            }}
          />

          {memos.map(({ id: memoId, text, top, left }, index) => {
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
                  if (!_wrapperRef.current) return;

                  const { scrollTop, scrollLeft } = _wrapperRef.current;
                  const { top, left } =
                    _wrapperRef.current.getBoundingClientRect();

                  const layerX = e.currentTarget.getAttribute("layerX");
                  const layerY = e.currentTarget.getAttribute("layerY");

                  const positionX =
                    clientX - Number(layerX) - left + scrollLeft;
                  const positionY = clientY - Number(layerY) - top + scrollTop;

                  e.currentTarget.style.top = positionY + "px";
                  e.currentTarget.style.left = positionX + "px";
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={(_e: React.MouseEvent) => {
                  console.log(_memosRef, _linesRef);
                  _memosRef.current.forEach((_memo) => {
                    _memo.classList.remove(styles.focus);
                    _memo.querySelector("div")?.blur();
                  });

                  _linesRef.current.forEach((_lineRef) => {
                    _lineRef.classList.remove(styles.focus);
                  });

                  setFocus(memoId);
                }}
              >
                <div
                  contentEditable
                  onClick={(e) => {
                    e.stopPropagation();
                    setState(_TYPINGSTATE);
                    // e.currentTarget.classList.add(styles.focus);
                    setFocus(memoId);
                  }}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter") {
                      e.currentTarget.blur();
                      e.currentTarget.classList.remove(styles.focus);
                      setState(_DEFAULTSTATE);
                      setFocus(null);
                    }
                  }}
                >
                  {text}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
