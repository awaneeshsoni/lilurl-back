import dotenv from "dotenv";
import express, { json } from "express";
import { connect, Schema, model } from "mongoose";
import { generate } from "shortid";
import cors from "cors"
dotenv.config();

const app = express();

// Middleware
app.use(json());
app.use(cors());

const MONGO = process.env.DB;
// MongoDB Connection
connect(MONGO)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// URL Schema
const urlSchema = new Schema({
  shortUrl: { type: String, required: true, unique: true },
  longUrl: { type: String, required: true },
});

const Url = model("Url", urlSchema);

// API Routes

//home
app.get('/',(req,res) => {
  res.send("working")
})

// Shorten a URL
app.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  const shortUrl = generate();
  const newUrl = new Url({ shortUrl, longUrl });

  try {
    await newUrl.save();
    res.status(201).json({ shortUrl, longUrl });
  } catch (error) {
    res.status(500).json({ message: "Error saving URL", error });
  }
});

// Redirect to the original URL
app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const url = await Url.findOne({ shortUrl });

    if (url) {
      res.redirect(url.longUrl);
    } else {
      res.status(404).json({ message: "URL not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error finding URL", error });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
