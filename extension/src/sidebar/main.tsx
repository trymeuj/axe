import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./sidebar.css";
import Sidebar from "./Sidebar";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sidebar />
  </StrictMode>
);
