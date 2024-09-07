require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the CORS middleware
const db = require("./DB/connect");
const authRouter = require("./Routes/auth");
const rapRoutes = require("./Routes/rap");
const stockRoutes = require("./Routes/stock");
const PartyRoutes = require("./Routes/party");
const BrokerRoutes = require("./Routes/broker");

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware

app.use(express.json());
app.use(cookieParser());

app.use(cors());
const corsOptions = {
  origin: "http://localhost:3000", // Only allow requests from this origin
  credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));

// DB connection
const start = async () => {
  try {
    await db.connectDB(process.env.MONGO_URI);
  } catch (error) {
    console.log(`Sorry, connection error! ${error}`);
  }
};
start();

// Routes
app.use("/auth", authRouter);
app.use("/stock", stockRoutes);
app.use("/rap", rapRoutes);
// app.use("/party", PartyRoutes);
// app.use("/broker", BrokerRoutes);

app.listen(PORT, () => {
  console.log(`Express is running on Port ${PORT}!`);
});
