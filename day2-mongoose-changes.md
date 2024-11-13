# Mongoose project day 2 changes

## In server.js

- add the following code below `app.use(express.json())`

```js
// import the collection models
const GroceryItem = require("./models/GroceryItem");
const Employee = require("./models/Employee");
// create a mapping object based on the models
const modelMapping = {
  GroceryInventory: GroceryItem,
  Employees: Employee,
};
```

- in the getConnection() function, in the mongoose.createConnection() method add the following as a second key:value pair after `dbName: dbName`

```js
autoIndex: false;
```

- in getConnection(), add the following code directly below the the mongoose.createConnection() method and above the console log for connection to database

```js
// Await the 'open' event to ensure the connection is established
await new Promise((resolve, reject) => {
  connections[dbName].once("open", resolve);
  connections[dbName].once("error", reject);
});
```

- in the getModel() function replace all of the code starting with and including
```js // Create a dynamic schema that accepts any fields
const dynamicSchema = new mongoose.Schema({}, { strict: false });
```
all the way to and including
```js
console.log("Created new model for collection:", collectionName);
```
with the below code:

```js
const Model = modelMapping[collectionName];

if (!Model) {
  // Use a dynamic schema with autoIndex disabled if no model is found
  const dynamicSchema = new mongoose.Schema(
    {},
    { strict: false, autoIndex: false }
  );
  models[modelKey] = connection.model(
    collectionName,
    dynamicSchema,
    collectionName
  );
  console.log(`Created dynamic model for collection: ${collectionName}`);
} else {
  // Use the predefined model's schema with autoIndex already disabled
  models[modelKey] = connection.model(
    Model.modelName,
    Model.schema,
    collectionName // Use exact collection name from request
  );
  console.log("Created new model for collection:", collectionName);
}
```

- paste in the following delete route below the app.get() route
```js
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

        // Remove the model associated with this collection
        const modelKey = `${database}-${collection}`;
        delete models[modelKey];

        res.status(200).json({ message: `Collection '${collection}' has been successfully deleted from database '${database}'.` });
    } catch (err) {
        console.error('Error deleting collection:', err);
        res.status(500).json({ error: 'An error occurred while deleting the collection.' });
    }
});
```

- type the following request below the get request in the api-test.http file
```bash

### Delete a Collection from a Database
DELETE http://localhost:3000/delete-collection/{{database}}/{{collection}}
Content-Type: application/json

###
```

- create a folder called `models/` at the root of the project
- create a file called GroceryItem.js inside 'models/'
- add the following code to GroceryItem.js
```js
// models/GroceryItem.js
const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema({});

module.exports = mongoose.model('GroceryItem', grocerySchema);
```
- create a file called Employee.js
- add the following code to Employee.js
```js

// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({});

module.exports = mongoose.model('Employee', employeeSchema);
