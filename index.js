const express = require('express') ;
const cors = require('cors') ;
require('dotenv').config() 
const app = express() ;
const port = process.env.PORT || 5000 ;


// middleware
app.use(cors()) ;
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tg0ohza.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db("taskDB").collection("users");
    const taskCollection = client.db("taskDB").collection("allTask");

    app.post('/users', async (req, res) => {
        const user = req.body;
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      });
      
      //get task by userEmail
       app.get('/tasks', async (req, res) => {
        let query = {} 
  
        if(req.query?.userEmail){
          query = { userEmail : req.query.userEmail }
          console.log(query)
        }
        
        const cursor = taskCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
      });
        //update task
        app.put('/updateTask/:id', async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) }
          const options = { upsert: true };
          const updateTask = req.body;
          console.log(updateTask)
        
          const task = {
              $set: {
                 name : updateTask.name,
                 priority : updateTask.priority,
                 postTime : updateTask.postTime,
                 description : updateTask.description,
              }
          }
        
          const result = await taskCollection.updateOne(filter, task,options);
          res.send(result);
        })

      app.get('/tasks/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await taskCollection.findOne(query);
        res.send(result);
      })

        //delete Task
        app.delete('/tasks/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const result = await taskCollection.deleteOne(query);
          res.send(result);
        })

      // add task 
  app.post('/tasks', async(req, res) => {
    const task = req.body ;
    const result = await taskCollection.insertOne(task);
    res.send(result);
  })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('task server is running')
})

app.listen(port, () => {
    console.log(`task server is running on port: ${port}`)
})
