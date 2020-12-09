require("dotenv").config();
const { Pool, Client } = require('pg');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { StreamChat } = require("stream-chat");

const app = express();

const corsOptions =  {
  origin: ['https://health-insurance123.herokuapp.com','http://localhost:3000']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const serverSideClient = new StreamChat(
  process.env.STREAM_API_KEY,
  process.env.STREAM_APP_SECRET
);
app.post("/join", async (req, res) => {
  const { username } = req.body;
  console.log(username);
  const token = serverSideClient.createToken(username);
  try {
    await serverSideClient.updateUser(
      {
        id: username
      },
      token
    );

    const admin = { id: "admin" };
    const channel = serverSideClient.channel("team", "chat", {
      name: "Public Forum",
      created_by: admin
    });

    await channel.create();
    await channel.addMembers([username]);
  } catch (err) {
    res.status(500).json({ err: err.message });
    return;
  }

  return res.status(200).json({ user: { username }, token })
  });

app.listen(process.env.PORT || 7000, () => {
  console.log(`Server running on PORT 7000`);
});

