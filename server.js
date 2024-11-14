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

app.post('/insert/:database/:collection', async (req, res) => {
    try {
        // extract the request parameters using destructuring
        const { database, collection } = req.params;
        // get the request body and store it as data
        const data = req.body;
        // Get the appropriate mongoose model for the specified database and collection by calling the getModel function and caching it as the const Model
        const Model = await getModel(database, collection)
        // Create a new instance of that model using the request body data and cache it to a const of newDocument
        const newDocument = new Model(data)
        // save the new document to the database using the save method asynchronously attached to the newDocument
        await newDocument.save()
        // log a success message to the console indicating wihch collection and database the document was added to
        console.log(`document was added to ${database}-${collection}`);
        // send back the newly created document as JSON with a 201 status code
        res.status(201).json({ message: "document was created successfully", document: newDocument });
    }
    catch (err) {
        // log any errors to the console
        console.error('Error in post route', err);
        // send back a 400 status code and the error message in the response
        res.status(400).json({ error: err.message });
    }
});

app.post('/insert/:database/:collection', async (req, res) => {
    try {
        const { database, collection } = req.params;
        const data = req.body;
        const Model = await getModel(database, collection)
        const newDocument = new Model(data)
        await newDocument.save()
        console.log(`document was added to ${database}-${collection}`);
        res.status(201).json({ message: "document was created successfully", document: newDocument });
    }
    catch (err) {
        console.error('Error in post route', err);
        res.status(400).json({ error: err.message });
    }
});

app.put('/update/:database/:collection/:id', async (req, res) => {
    try {
        // cache the req.params through destructuring
        const { database, collection, id } = req.params;
        // cache the req.body as the const data
        const data = req.body;
        // cache the returned model as Model
        const Model = await getModel(database, collection);
        // cache the returned updated document using the .findByIdAndUpdate() method
        const updatedDocument = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        // log document with id was updated successfully
        console.log(`Document with id: ${id} was updated successfully`);
        // if document was not found early return with a 404 status and error message
        if (!updatedDocument) {
            return res.status(404).json({ error: "Document not found" });
        }
        // otherwise respond with a 200 status code and send back the jsonified updated Document
        res.status(200).json(updatedDocument);
    } catch (err) {
        // if there was an error return a bad request status and log the error to the console
        console.error(`Therer was an error in the PUT route`, err);
        res.status(400).json({ error: err.message });
    }
});
app.delete('/delete/:database/:collection/:id', async (req, res) => {
    try {
        const { database, collection, id } = req.params;
        const Model = await getModel(database, collection);
        const deletedDocument = await Model.findByIdAndDelete(id);
        if (!deletedDocument) {
            return res.status(404).json({
                error: 'Document not found'
            });
        }
        console.log(`Document with id ${id} deleted from collection`);
        res.status(200).json({ message: 'document deleted successfully' });
    }
    catch (err) {
        console.error('There was an error in the Delete route', err);
        res.status(400).json({ error: err.message });
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