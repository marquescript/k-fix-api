import mongoose, { ConnectOptions, Connection } from "mongoose"; // Importe Connection

let MONGODB_URI = process.env.NODE_ENV === 'dev' ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined."); // Adicionar console.error
    throw new Error("MONGODB_URI is not defined");
}

mongoose.set('bufferCommands', false);
// mongoose.set('strictQuery', true); // Exemplo, se preferir true

// Variável para armazenar a promessa da conexão ativa ou em andamento
let connectionPromise: Promise<Connection> | null = null;

async function connectToMongoDB(): Promise<Connection> {
    if (mongoose.connection.readyState === 1) {
        // console.log("=> Reusing existing MongoDB connection (Mongoose)");
        return mongoose.connection;
    }

    if (connectionPromise) {
        // console.log("=> Waiting for ongoing MongoDB connection (Mongoose)...");
        return connectionPromise;
    }

    // console.log("=> Creating new MongoDB connection (Mongoose)...");
    const opts: ConnectOptions = {
        bufferCommands: false, // Já está global, mas não custa
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000, // Ajuste conforme necessário
        connectTimeoutMS: 10000, // Ajuste conforme necessário
        // maxPoolSize: 5, // Ajuste o pool size para serverless
        // minPoolSize: 1,
        authSource: 'admin' // Se suas credenciais estiverem no banco admin
    };

    connectionPromise = mongoose.connect(MONGODB_URI as string, opts)
        .then(mongooseInstance => {
            // console.log("   MongoDB Connected successfully (Mongoose)!");
            // Adicionar listeners de evento aqui é uma boa prática
            mongooseInstance.connection.on('error', err => {
                console.error('MongoDB connection error after initial connection:', err);
                connectionPromise = null; // Limpa a promessa para permitir nova tentativa
            });
            mongooseInstance.connection.on('disconnected', () => {
                console.log('MongoDB disconnected!');
                connectionPromise = null; // Limpa a promessa
            });
            return mongooseInstance.connection;
        })
        .catch(error => {
            console.error("Failed to connect to MongoDB (Mongoose)", error);
            connectionPromise = null; // Limpa a promessa em caso de falha
            throw error; // Relança o erro para a função chamadora
        });

    return connectionPromise;
}

export default connectToMongoDB;