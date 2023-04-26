import { MongoClient, ObjectId } from 'mongodb'

interface Administrator {
    _id: string
    name: string
    email: string
    password: string
  }
  
// Connection URL
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)

const administrators:Administrator[] = [
    {
        _id: "alice",
        name: "alice",
        email: "alice@administrator.com",
        password: "password1"
    },
    {
        _id: "diana",
        name: "diana",
        email: "diana@administrator.com",
        password: "password2"
    },
]

async function main() {
  await client.connect()
  console.log('Connected successfully to MongoDB')

  const db = client.db("test")

//   // set up unique index for upsert -- to make sure a customer cannot have more than one draft order
//   db.collection("orders").createIndex(
//     { customerId: 1 }, 
//     { unique: true, partialFilterExpression: { state: "draft" } }
//   )

  // add data
  console.log("inserting administrators", await db.collection("administrators").insertMany(administrators as any))

  process.exit(0)
}

main()
