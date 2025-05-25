import mongoose, { connect } from "mongoose"
import { MongoClient, Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if(!MONGODB_URI){
    throw new Error("MONGODB_URI is not defined")
}

let cachedClient: MongoClient | null = null
let cachedDB: Db | null = null

async function connectToMongoDB(){
    if (cachedClient && cachedDB && mongoose.connection.readyState === 1){
        return { client: cachedClient, db: cachedDB }
    }

    try{
        const opts = { bufferCommands: false }
        const mongooseInstance = await connect(MONGODB_URI as string, opts)
        cachedClient = mongooseInstance.connection.getClient()
        const db = mongooseInstance.connection.db
        if (!db) throw new Error("Failed to get database instance")
        cachedDB = db
        return { client: cachedClient, db: cachedDB }
    }catch(error){
        console.error("Failed to connect to MongoDB", error)
        throw error
    }
}

export default connectToMongoDB