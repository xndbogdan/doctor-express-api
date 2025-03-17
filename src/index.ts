import express, { Application, Request, Response } from "express";
import routes from "@/routes";
import cors from "cors";
import 'dotenv/config';
import { DateTime, Settings } from "luxon";
import { appConfig } from "./config";

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app: Application = express();
const PORT: number = 3000;

Settings.defaultZone = appConfig.TZ;
console.info(`Application timezone set to ${DateTime.local().zoneName}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Not Found",
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});