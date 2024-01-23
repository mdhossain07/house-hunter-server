const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.esabfel.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const userCollection = client.db("houseDB").collection("users");
    const houseCollection = client.db("houseDB").collection("houses");
    const bookingCollection = client.db("houseDB").collection("bookings");

    // user related API
    app.post("/api/v1/create-user", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };
      const isExist = await userCollection.findOne(query);

      if (isExist) {
        return res.send({ message: "user already exist" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/api/v1/users", async (req, res) => {
      const { email } = req.query;
      const { pass } = req.query;
      const query = { email: email };
      const result = await userCollection.findOne(query);

      if (result?.password === pass) {
        res.send(result);
      } else {
        res.send({ message: "Invalid User" });
      }

      //   console.log(result);

      //   if (password === pass) {
      //     console.log(result);
      //   }
      //   res.send(result);
    });

    // house related API

    app.post("/api/v1/add-house", async (req, res) => {
      const house = req.body;
      const result = await houseCollection.insertOne(house);
      res.send(result);
    });

    app.get("/api/v1/houses", async (req, res) => {
      const result = await houseCollection.find().toArray();
      res.send(result);
    });

    app.get("/api/v1/house/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await houseCollection.findOne(query);
      res.send(result);
    });

    app.delete("/api/v1/delete-house/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await houseCollection.deleteOne(query);
      res.send(result);
    });

    // booking related API

    app.post("/api/v1/book-house", async (req, res) => {
      const bookingInfo = req.body;
      const result = await bookingCollection.insertOne(bookingInfo);
      res.send(result);
    });

    app.get("/api/v1/bookings", async (req, res) => {
      // const query = {email: }
      // const result = await
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("house hunter server has started");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
