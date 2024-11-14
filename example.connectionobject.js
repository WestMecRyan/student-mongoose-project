Connection {
    // Base properties
    id: 0,
    name: "BigBoxStore",
    host: "mongodb://localhost:27017",
    port: 27017,

    // Connection state
    readyState: 1,  // 1 means connected

    // Important methods
    model(): Function,  // Used to create/retrieve models
    collection(): Function,  // Used to access collections directly
    dropDatabase(): Function,
    close(): Function,

    // Event emitters
    on(): Function,  // For event listening
    once(): Function,
    emit(): Function,

    // Internal Mongoose properties
    models: {
        // Contains registered models for this connection
        "GroceryItem": Model,
        "User": Model
    },

    // Configuration
    config: {
        autoIndex: false,
        dbName: "BigBoxStore"
    }
}