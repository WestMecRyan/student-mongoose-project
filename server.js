const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// import the collection models
const GroceryItem = require('./models/GroceryItem');
const Employee = require('./models/Employee');
// create a mapping object based on the models
const modelMapping = {
    GroceryInventory: GroceryItem,
    Employees: Employee
};

const connections = {};
const models = {};

const getConnection = async (dbName) => {
    console.log(`getConnection called with ${dbName}`);

    if (!connections[dbName]) {
        connections[dbName] = await mongoose.createConnection(process.env.MONGO_URI, { dbName: dbName, autoIndex: false });
        // Await the 'open' event to ensure the connection is established
        await new Promise((resolve, reject) => {
            connections[dbName].once('open', resolve);
            connections[dbName].once('error', reject);
        });
        console.log(`Connected to database ${dbName}`);
    } else {
        console.log('Reusing existing connection for db', dbName);
    }
    return connections[dbName];
};

const getModel = async (dbName, collectionName) => {
    console.log("getModel called with:", { dbName, collectionName });
    const modelKey = `${dbName}-${collectionName}`;

    if (!models[modelKey]) {
        const connection = await getConnection(dbName);
        const Model = modelMapping[collectionName];

        if (!Model) {
            // Use a dynamic schema if no model is found
            const dynamicSchema = new mongoose.Schema({}, { strict: false, autoIndex: false });
            models[modelKey] = connection.model(
                collectionName,
                dynamicSchema,
                collectionName
            );
            console.log(`Created dynamic model for collection: ${collectionName}`);
        } else {
            models[modelKey] = connection.model(
                Model.modelName,
                Model.schema,
                collectionName  // Use exact collection name from request
            );
            console.log("Created new model for collection:", collectionName);
        }
    }

    return models[modelKey];
};

app.get('/find/:database/:collection', async (req, res) => {
    try {
        const { database, collection } = req.params;
        const Model = await getModel(database, collection);
        const documents = await Model.find({});
        console.log(`query executed, document count is: ${documents.length}`);
        res.status(200).json(documents);
    }
    catch (err) {
        console.error('Error in GET route', err);
        res.status(500).json({ error: err.message });
    }
});

// POST route to add a new document
app.post('/insert/:database/:collection', async (req, res) => {
    try {
        const { database, collection } = req.params;
        const data = req.body;

        // Get the model for the specified collection
        const Model = await getModel(database, collection);

        // Create a new instance of the model with the provided data
        const newDocument = new Model(data);

        // Save the document to the database
        await newDocument.save();

        console.log(`Document added to collection '${collection}' in database '${database}'`);
        res.status(201).json(newDocument);
    } catch (err) {
        console.error('Error in POST route', err);

        // Return validation errors to the client
        res.status(400).json({ error: err.message });
    }
});

// PUT route to update a document by ID
app.put('/update/:database/:collection/:id', async (req, res) => {
    try {
        const { database, collection, id } = req.params;
        const data = req.body;

        // Get the model for the specified collection
        const Model = await getModel(database, collection);

        // Find the document by ID and update it
        const updatedDocument = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });

        if (!updatedDocument) {
            return res.status(404).json({ error: 'Document not found' });
        }

        console.log(`Document with ID '${id}' updated in collection '${collection}'`);
        res.status(200).json(updatedDocument);
    } catch (err) {
        console.error('Error in PUT route', err);

        // Return validation errors to the client
        res.status(400).json({ error: err.message });
    }
});

// DELETE route to delete a document by ID
app.delete('/delete/:database/:collection/:id', async (req, res) => {
    try {
        const { database, collection, id } = req.params;

        // Get the model for the specified collection
        const Model = await getModel(database, collection);

        // Find the document by ID and delete it
        const deletedDocument = await Model.findByIdAndDelete(id);

        if (!deletedDocument) {
            return res.status(404).json({ error: 'Document not found' });
        }

        console.log(`Document with ID '${id}' deleted from collection '${collection}'`);
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error('Error in DELETE route', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE route to delete a specific collection in a database
app.delete('/delete-collection/:database/:collection', async (req, res) => {
    try {
        const { database, collection } = req.params;
        const connection = await getConnection(database); // Establish or retrieve the connection

        // Check if the collection exists
        const collections = await connection.db.listCollections({ name: collection }).toArray();
        const collectionExists = collections.length > 0;

        if (!collectionExists) {
            return res.status(404).json({ error: `Collection '${collection}' does not exist in database '${database}'.` });
        }

        // Drop the collection
        await connection.db.dropCollection(collection);
        console.log(`Collection '${collection}' deleted from database '${database}'.`);

        // Remove all models associated with this collection
        const modelKey = `${database}-${collection}`;
        delete models[modelKey];

        res.status(200).json({ message: `Collection '${collection}' has been successfully deleted from database '${database}'.` });
    } catch (err) {
        console.error('Error deleting collection:', err);
        res.status(500).json({ error: 'An error occurred while deleting the collection.' });
    }
});


async function startServer() {
    try {
        app.listen(port, () => {
            console.log(`server is listening on ${port}`);
        })
    }
    catch (error) {
        console.error('error starting the server');
        process.exit(1);
    }
}

startServer();