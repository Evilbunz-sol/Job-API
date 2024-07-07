// Core Packages
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

// Security Packages
const helmet = require("helmet")
const cors = require("cors")
const xss = require("xss-clean")
const rateLimiter = require("express-rate-limit")

// Swagger Packages
const swaggerUI = require("swagger-ui-express")
const YAML = require("yamljs")
const swaggerFile = YAML.load("./swagger.yaml")

// Connect DB
const connectDB = require("./db/connect")

// Middleware
const authenticateUser = require("./middleware/authentication")

// Routers
const authRouter = require("./routes/auth")
const jobRouter = require("./routes/jobs")

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Application Start
app.use(express.json())

app.set("trust proxy", 1)
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100  // Limit each IP to 100 requests per windowMs (15minutes)
}))

// routes
app.get("/", (req,res) => {res.send(`<h1> Jobs API </h1> <a href="/api-docs"> Documentation </a>`)})
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerFile))

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/jobs", authenticateUser, jobRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
