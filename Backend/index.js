import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import spinRoutes from "./src/routes/spin.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import otpRoutes from "./src/routes/otp.routes.js";
import shopifyRoutes from "./src/routes/shopify.routes.js";
import {
  securityHeaders,
  generalRateLimiter,
  adminRateLimiter,
  corsOptions,
  requestLogger,
  errorHandler,
  notFoundHandler,
} from "./src/middleware/security.js";
import { fraudDetectionMiddleware } from "./src/utils/fraudPrevention.js";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(securityHeaders);
}

app.use(cors(process.env.NODE_ENV === "production" ? corsOptions : {}));

app.use(express.json({ limit: "10kb" })); 

app.use(requestLogger);


app.use(fraudDetectionMiddleware);


app.use(generalRateLimiter);


app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", spinRoutes);


app.use("/api", otpRoutes);

app.use("/api/admin", adminRateLimiter, adminRoutes);


app.use("/api/shopify", shopifyRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

(async () => {
  await connectDB();
  app.listen(process.env.PORT || 5000, () => {
    console.log(
      `Backend running on http://localhost:${process.env.PORT || 5000}`,
    );
  });
})();
