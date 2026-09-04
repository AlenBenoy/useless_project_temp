import express from "express";
import cors from "cors";


const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Supreme Court API is running"
  });
});

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

export default app;