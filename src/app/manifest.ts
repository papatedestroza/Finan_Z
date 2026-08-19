import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finan_Z",
    short_name: "Finan_Z",
    description: "Control de finanzas personales, rápido y sin vueltas.",
    start_url: "/",
    display: "standalone",
    background_color: "#14120f",
    theme_color: "#14120f",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
