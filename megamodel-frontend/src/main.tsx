import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ComponentPage } from "./pages/ComponentPage";
import { GomPage } from "./pages/GomPage";
import { MicroservicePage } from "./pages/MicroservicePage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ComponentPage />,
      },
      {
        path: "goms",
        element: <GomPage />,
      },
      {
        path: "microservices",
        element: <MicroservicePage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
