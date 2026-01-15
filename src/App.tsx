import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  BinaryFileData,
  ExcalidrawImperativeAPI,
  ExcalidrawElement,
} from "@excalidraw/excalidraw/types";
import { useEffect, useState, type ChangeEvent } from "react";

function App() {
  // Initial elements with proper typing
  const elements = convertToExcalidrawElements([
    {
      type: "rectangle",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      boundElements: null,
      version: 1,
      versionNonce: 1,
      id: "rect-1",
    },
    {
      type: "text",
      x: 200,
      y: 200,
      text: "Hello",
      fontSize: 20,
      fontFamily: 1,
      textAlign: "left",
      verticalAlign: "top",
      width: 100,
      height: 30,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      isDeleted: false,
      boundElements: null,
      version: 1,
      versionNonce: 2,
      id: "text-1",
    },
    {
      id: "fAULCkJwArU1bWXXO-h0g",
      type: "image",
      x: 509,
      y: 233,
      width: 230,
      height: 172,
      angle: 0,
      strokeColor: "transparent",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      index: "a2",
      roundness: null,
      seed: 1344348623,
      version: 16,
      versionNonce: 649081263,
      isDeleted: false,
      boundElements: null,
      updated: 1768484635439,
      link: null,
      locked: false,
      status: "pending",
      fileId: "cae035a520410db2b55d412678beb6fd5e1256d8",
      scale: [1, 1],
      crop: null,
    },
  ]);

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    const appState = excalidrawAPI?.getAppState();
    console.log(appState);
  }, [excalidrawAPI]);

  function fileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      console.log("Data URL:", dataUrl);
      console.log("Base64 String:", dataUrl);
      // console.log(fileData);
      // excalidrawAPI?.addFiles([fileData]);

      const fileData: BinaryFileData = {
        mimeType: file.type || "application/octet-stream",
        dataURL: dataUrl,
        created: Date.now(),
        lastRetrieved: Date.now(),
        id: "cae035a520410db2b55d412678beb6fd5e1256d8",
      };
      excalidrawAPI?.addFiles([fileData]);
    };
    reader.readAsDataURL(file);
  }

  function click1(e: React.MouseEvent<HTMLButtonElement>) {
    console.log(excalidrawAPI?.getSceneElements());
  }

  function click2(e: React.MouseEvent<HTMLButtonElement>) {
    console.log(excalidrawAPI?.getFiles());
  }

  return (
    <div style={{ height: "100vh" }}>
      <input type="file" onChange={fileChange} accept="image/*" />
      <button onClick={click1}>Export</button>
      <button onClick={click2}>Export2</button>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{ elements }}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            export: { saveFileToDisk: true },
            loadScene: true,
            saveToActiveFile: false,
            toggleTheme: true,
          },
        }}
      />
    </div>
  );
}

export default App;
