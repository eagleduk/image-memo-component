import {
  CaptureUpdateAction,
  Excalidraw,
  MainMenu,
  convertToExcalidrawElements,
  exportToCanvas,
  exportToBlob,
  exportToSvg,
  MIME_TYPES,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  BinaryFileData,
  ExcalidrawImperativeAPI,
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

  function click3(e: React.MouseEvent<HTMLButtonElement>) {
    console.log(excalidrawAPI?.getAppState());
    excalidrawAPI?.updateScene({
      elements: [
        ...excalidrawAPI?.getSceneElements(),
        {
          type: "rectangle",
          version: 141,
          versionNonce: 361174001,
          isDeleted: false,
          id: "oDVXy8D6rom3H1-LLH2-f",
          fillStyle: "hachure",
          strokeWidth: 1,
          strokeStyle: "solid",
          roughness: 1,
          opacity: 100,
          angle: 0,
          x: 100.50390625,
          y: 93.67578125,
          strokeColor: "#c92a2a",
          backgroundColor: "transparent",
          width: 186.47265625,
          height: 141.9765625,
          seed: 1968410350,
          groupIds: [],
          boundElements: null,
          locked: false,
          link: null,
          updated: 1,
          roundness: {
            type: 3,
            value: 32,
          },
        },
        {
          type: "text",
          text: "Helloxcvcx",
          version: 141,
          versionNonce: 361174001,
          isDeleted: false,
          id: "oDVXy8D6rom3H1-LLH2-fsdfg",
          fillStyle: "hachure",
          strokeWidth: 1,
          strokeStyle: "solid",
          roughness: 1,
          opacity: 100,
          angle: 0,
          x: 100.50390625,
          y: 93.67578125,
          strokeColor: "#c92a2a",
          backgroundColor: "transparent",
          fontSize: 20,
          fontFamily: 1,
          textAlign: "left",
          verticalAlign: "top",
          width: 186.47265625,
          height: 141.9765625,
          seed: 1968410350,
          groupIds: [],
          boundElements: null,
          locked: false,
          link: null,
          updated: 1,
          roundness: {
            type: 3,
            value: 32,
          },
        },
      ],
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  }

  async function click4(e: React.MouseEvent<HTMLButtonElement>) {
    console.log("click4");
    const canvas = await exportToCanvas(
      excalidrawAPI?.getSceneElements() || [],
      excalidrawAPI?.getAppState() || {},
      excalidrawAPI?.getFiles() || [],
      {}
    );

    console.log(canvas.toDataURL());

    console.log(exportToSvg);
    const svg = await exportToSvg(
      excalidrawAPI?.getSceneElements() || [],
      excalidrawAPI?.getAppState() || {},
      excalidrawAPI?.getFiles() || []
    );

    console.log(svg);

    console.log(exportToBlob);

    const blob = await exportToBlob({
      minType: MIME_TYPES.png,
      quality: 1,
      elements: excalidrawAPI?.getSceneElements() || [],
      appState: excalidrawAPI?.getAppState() || {},
      files: excalidrawAPI?.getFiles() || [],
    });

    console.log(blob);
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: "30px", width: "100%" }}>
        <input type="file" onChange={fileChange} accept="image/*" />
        <button onClick={click1}>Export</button>
        <button onClick={click2}>Export2</button>
        <button onClick={click3}>Export3</button>
        <button onClick={click4}>save</button>
      </div>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements,
          appState: {
            openSidebar: null,
          },
        }}
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
      >
        <MainMenu>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.Item onSelect={() => window.alert("Item1")}>
            Item1
          </MainMenu.Item>
          <MainMenu.Item onSelect={() => window.alert("Item2")}>
            Item 2
          </MainMenu.Item>
        </MainMenu>
      </Excalidraw>
    </div>
  );
}

export default App;
