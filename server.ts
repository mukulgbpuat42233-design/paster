import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

// Serve static files from root directory
app.use(express.static(path.join(process.cwd())));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// SPA fallback for index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
