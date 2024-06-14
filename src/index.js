import express from "express";
import cors from "cors";

import authRoute from "./routes/auth.js";
import jobRoute from "./routes/jobs.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Example route
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

app.use("/", authRoute);
app.use("/", jobRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
