import styles from "./App.module.css";

import { useId, useRef, useState } from "react";

// 시작전(이미지 로드 전), 이미지 로드 후, 텍스트 박스 찍기, 텍스트 입력 중, 라인 그리기 시작, 라인 그리는 중
const _READYSTATE = null;
const _DEFAULTSTATE = 0;
const _TEXTSTATE = 10;
const _TYPINGSTATE = 11;
const _LINESTATE = 20;
const _DRAWINGSTATE = 21;

// 등록/삭제 상태
const _CREATE = 1;
const _DELETE = -1;

function updateSvgPath(e, id, focus) {
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

function getMousePosition(e, id) {
  const paint = document.getElementById(id);
  const rect = paint.getBoundingClientRect();
  return {
    x: e.pageX - rect.left,
    y: e.pageY - rect.top,
  };
}

function App() {
  const id = useId();

  const _wrapperRef = useRef<HTMLDivElement>(null);
  const _svgRef = useRef<SVGSVGElement>(null);
  const _imageRef = useRef<HTMLImageElement>(null);
  const _addLineBtnEl = useRef<HTMLButtonElement>(null);
  const _addTextAreaBtnEl = useRef<HTMLButtonElement>(null);

  const [memos, setMemos] = useState<HTMLDivElement[]>([]);
  const [paths, setPaths] = useState<SVGPathElement[]>([]);
  const [focus, setFocus] = useState<HTMLElement | null>(null);
  const [state, setState] = useState<null | number>(_READYSTATE);

  const [prevState, setPrevState] = useState<
    { type: number; target: string; element: HTMLElement }[]
  >([]);
  const [nextState, setNextState] = useState<
    { type: number; target: string; element: HTMLElement }[]
  >([]);

  function stateBtnEnabled() {
    textStateEnabled();
    lineStateEnabled();
  }

  function textStateEnabled() {
    const textAreaBtnEl = document.getElementById(id + "_textArea_btn");
    if (textAreaBtnEl) {
      textAreaBtnEl.classList.remove("active");
      textAreaBtnEl.removeAttribute("disabled");
    }
  }

  function textStateDisabled() {
    const textAreaBtnEl = document.getElementById(id + "_textArea_btn");
    if (textAreaBtnEl) {
      textAreaBtnEl.classList.add("active");
      textAreaBtnEl.setAttribute("disabled", "true");
    }
  }

  function lineStateEnabled() {
    const lineBtnEl = document.getElementById(id + "_line_btn");
    if (lineBtnEl) {
      lineBtnEl.classList.remove("active");
      lineBtnEl.removeAttribute("disabled");
    }
  }

  function lineStateDisabled() {
    const lineBtnEl = document.getElementById(id + "_line_btn");
    if (lineBtnEl) {
      lineBtnEl.classList.add("active");
      lineBtnEl.setAttribute("disabled", "true");
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
    const uuidStr = window.crypto
      .getRandomValues(new Uint32Array(1))[0]
      .toString(36);

    const memoId = id + "_memo_" + uuidStr;

    const memo = document.createElement("article");
    memo.draggable = true;
    memo.id = memoId;
    memo.className = styles.memo;
    memo.dataset.anchor = "--" + id + "-image";
    memo.style.top = (text === null ? y - 15 : y) + "px";
    memo.style.left = (text === null ? x - 50 : x) + "px";

    memo.addEventListener("dragstart", (e: DragEvent) => {
      const {
        layerX,
        layerY,
        // target: { clientWidth, clientHeight },
      } = e;

      e.target?.setAttribute("layerX", String(layerX));
      e.target?.setAttribute("layerY", String(layerY));
    });
    memo.addEventListener("dragend", (e: DragEvent) => {
      const { clientX, clientY } = e;
      // const { clientWidth, clientHeight } = e.currentTarget;
      const { scrollTop, scrollLeft } = e.target.parentElement;
      const { top, left } = e.target.parentElement.getBoundingClientRect();

      const layerX = e.currentTarget.getAttribute("layerX");
      const layerY = e.currentTarget.getAttribute("layerY");

      const positionX = clientX - Number(layerX) - left + scrollLeft;
      const positionY = clientY - Number(layerY) - top + scrollTop;

      e.currentTarget.style.top = positionY + "px";
      e.currentTarget.style.left = positionX + "px";
    });
    memo.addEventListener("dragover", (e) => e.preventDefault());
    memo.addEventListener("click", (e: MouseEvent) => {
      setMemos((c) =>
        c.map((memo) => {
          memo.classList.remove("focus");
          return memo;
        })
      );

      memo.classList.add("focus");
      setFocus(memo);
    });

    new ResizeObserver((entries) => {
      console.log("container resized", entries.target);
    }).observe(memo);

    const textArea = document.createElement("div");
    textArea.contentEditable = "true";
    textArea.innerHTML = text ?? "";

    textArea.addEventListener("click", (e) => {
      e.stopPropagation();
      setState(_TYPINGSTATE);
      console.log("text area clicked", memoId);
      memo.classList.add("focus");
      setFocus(memo);
    });

    textArea.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        textArea.blur();
        memo.classList.remove("focus");
        setState(_DEFAULTSTATE);
        setFocus(null);
      }
    });

    memo.appendChild(textArea);
    // memo.contentEditable = true;

    setMemos((m) => [...m, memo]);
    // this.#ids.push(memoId);
    addTimeLine({ type: _CREATE, element: memo });
    return memo;
  }

  function createPath(
    e,
    { fill = "none", stroke = "#000000", strokeWidth = 3 }
  ) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const uuidStr = window.crypto
      .getRandomValues(new Uint32Array(1))[0]
      .toString(36);

    const pathId = id + "_path_" + uuidStr;

    // TODO: Option 처리
    path.setAttribute("id", pathId);
    path.setAttribute("fill", fill);
    path.setAttribute("stroke", stroke);
    path.setAttribute("stroke-width", String(strokeWidth));
    path.setAttribute("stroke-linejoin", "round");
    path.classList.add("path");
    path.addEventListener("click", (e) => {
      // e.stopPropagation();
      console.log("path clicked", pathId);
      setFocus(document.getElementById(pathId));

      setPaths((p) => {
        p.forEach((path) => path.classList.remove("focus"));
        return p;
      });
      path.classList.add("focus");
    });
    const pt = getMousePosition(e, id + "_paint");

    path.dataset.startX = String(pt.x);
    path.dataset.startY = String(pt.y);

    // appendToBuffer(pt);
    // path.setAttribute("d", strPath);

    _wrapperRef.current?.appendChild(path);

    setState(_DRAWINGSTATE);
    setFocus(path);
    setPaths((p) => [...p, path]);

    addTimeLine({ type: _CREATE, element: path });

    return path;
  }

  return (
    <div
      id={id}
      className={styles.content}
      onClick={(e) => {
        const element = e.currentTarget;

        if (state === _READYSTATE || state === _DRAWINGSTATE) return;

        if (
          element.nodeName === "ARTICLE" ||
          (element.nodeName === "INPUT" && element.type === "color") ||
          (element.nodeName === "INPUT" && element.type === "number") ||
          element.nodeName === "path"
        ) {
          return;
        }

        setMemos((m) => {
          m.forEach((memo) => {
            memo.classList.remove("focus");
            memo.querySelector("div").blur();
          });

          return m;
        });

        setPaths((p) => {
          p.forEach((path) => path.classList.remove("focus"));
          return p;
        });

        setFocus(null);
      }}
      onKeyDown={(e) => {
        if (e.code === "Escape") {
          setState(_DEFAULTSTATE);
          e.target.dispatchEvent(new Event("click"));
        } else if (e.code === "Delete") {
          if (state === _TYPINGSTATE) {
            return;
          }
          if (focus) {
            // TODO: 텍스트 입력중 바로 삭제해버림. 입력중 상태라도 필요할 듯
            const element = document.getElementById(focus);
            addTimeLine({ type: _DELETE, element: element });
            element.remove();
            setFocus(null);
          }
        }
        // TODO: 되돌리기 실행취소 테스트
        if (e.ctrlKey && e.code === "KeyZ") {
          if (focus !== null) return;

          if (prevState.length === 0) return;

          const latest = prevState[-1];

          setPrevState((p) => {
            p.pop();
            return p;
          });

          setNextState((p) => [...p, latest]);

          if (latest.type === _CREATE) {
            const element = document.getElementById(latest.target);
            element.remove();
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

          const latest = nextState[-1];

          setNextState((p) => {
            p.pop();
            return p;
          });

          setPrevState((p) => [...p, latest]);

          if (latest.type === _CREATE) {
            const element = latest.element;

            if (element.nodeName === "ARTICLE") {
              _wrapperRef.current?.appendChild(element);
            }

            if (element.nodeName === "path") {
              _svgRef.current?.appendChild(element);
            }
          } else if (latest.type === _DELETE) {
            const element = document.getElementById(latest.target);
            element?.remove();
          }
        }

        if (e.code === "KeyL") {
          console.log("라인 그리기");
          if (focus !== null) return;
          _addLineBtnEl.current?.click();
        }
        if (e.code === "KeyT") {
          console.log("TextArea 그리기");
          if (focus !== null) return;
          _addTextAreaBtnEl.current?.click();
        }
      }}
    >
      <div className={styles.toolbar}>
        <input
          type="file"
          id={id + "_file_input"}
          accept="image/*"
          onChange={(e) => {
            const uploadFile = e.target.files;

            setMemos([]);
            setPaths([]);

            setFocus(null);
            setState(_READYSTATE);

            setPrevState([]);
            setNextState([]);

            if (!uploadFile || uploadFile?.length === 0) {
              _imageRef.current.src = "";
              return;
            }

            const base64 = new Blob([uploadFile[0]], {
              type: uploadFile[0].type,
            });

            const url = window.URL.createObjectURL(base64);

            if (_imageRef.current) _imageRef.current.src = url;
          }}
        />

        <button>SAVE</button>

        <button
          id={id + "_textArea_btn"}
          ref={_addTextAreaBtnEl}
          onClick={(e) => {
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
          ref={_addLineBtnEl}
          onClick={(e) => {
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
                document.getElementById(focus)?.remove();

                setPrevState((c) => c.pop());
                setPaths((p) => p.pop());
              }
            }}
            onClick={(e) => {
              if (state === _TEXTSTATE) {
                const rect = _svgRef.current?.getBoundingClientRect();

                if (!rect) return;

                const memo = createMemo(null, {
                  x: e.pageX - rect.left,
                  y: e.pageY - rect.top,
                });
                _wrapperRef.current?.appendChild(memo);

                setState(_DEFAULTSTATE);
                stateBtnEnabled();
              } else if (state === _LINESTATE) {
                const path = createPath(e, {});

                _svgRef.current?.appendChild(path);

                setState(_DRAWINGSTATE);
                setFocus(path);
              } else if (state === _DRAWINGSTATE) {
                // const focus = this.#focus;

                updateSvgPath(e, id + "_paint", focus);

                const path = createPath(e, {});

                _svgRef.current?.appendChild(path);

                setState(_DRAWINGSTATE);
                setFocus(path);
              }
            }}
            onMouseMove={(e) => {
              if (state === _DRAWINGSTATE) {
                updateSvgPath(e, id + "_paint", focus);
              }
            }}
          ></svg>

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
        </div>
      </div>
    </div>
  );
}

export default App;
