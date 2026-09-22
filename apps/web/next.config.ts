import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly tell Turbopack the monorepo root so it can resolve
    // packages hoisted into the root node_modules by npm workspaces.
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
