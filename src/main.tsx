import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/app.css";
import { tr } from "./i18n";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2"));
  } catch {
    return false;
  }
}

const root = createRoot(document.getElementById("root")!);
if (!hasWebGL()) {
  root.render(
    <div className="fatal">
      <h1>{tr("无法显示三维模型", "Cannot display the 3D model")}</h1>
      <p>{tr("你的浏览器不支持 WebGL 2。请使用最新版 Chrome、Edge、Firefox 或 Safari，并确认已开启硬件加速。", "Your browser does not support WebGL 2. Please use a recent Chrome, Edge, Firefox or Safari with hardware acceleration enabled.")}</p>
    </div>,
  );
} else root.render(<App />);
