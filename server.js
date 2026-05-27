const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const checker = require("./api/checker");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/check", checker);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});