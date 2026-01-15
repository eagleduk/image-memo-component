import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

function App() {
  return (
    <>
      <Excalidraw
        aiEnabled={false}
        zenModeEnabled={false}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: true,
            export: false,
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
            saveAsImage: true,
          },
          tools: {
            image: true,
          },
        }}
        initialData={{
          appState: {
            openSidebar: null,
          },
        }}
      />
    </>
  );
}

export default App;
