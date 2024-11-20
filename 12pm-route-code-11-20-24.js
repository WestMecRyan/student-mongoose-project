app.put('/update/:database/:collection/:id', async (req, res) => {
    let id;
    try {
        id = req.params.id;
        // Extract the database, collection, and id from request parameters
        const { database, collection } = req.params;
        // Get the request body as data
        const data = req.body;
        // Get the appropriate Mongoose model
        const Model = await getModel(database, collection);
        // Find the document by id and update it

        const updatedDocument = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        // If document was not found, early return with a 404 status and error message
        if (!updatedDocument) {
            return res.status(404).json({ error: 'document not found' });
        }
        // Log a success message to the console
        console.log(`Successfully updated document with id: ${id}`);
        // Send back the updated document with a 200 status code
        res.status(200).json({ message: `document: ${id} has been updated` });
    } catch (err) {
        id = req.params.id;
        // Log error to the console
        console.error(`document with id: ${id} something went wrong`, err);
        // Send back a 400 status code with the error message
        res.status(400).json({ error: err.message });
    }
});

app.delete('/delete/:database/:collection/:id', async (req, res) => {
    const { database, collection, id } = req.params;
    if (!database || !collection || !id) {
        return res.status(400).json({ message: "error in your parameters" });
    }
    try {
        // Extract the database, collection, and id from request parameters
        // Get the appropriate Mongoose model
        const Model = await getModel(database, collection);
        // Find and delete the document by id
        const deletedDocument = await Model.findByIdAndDelete(id);
        // If document not found, return 404 status code with error message
        if (!deletedDocument) {
            return res.status(404).json({ message: "item was not found" });
        }
        // Log success message to the console
        console.log("success deleting document");
        // Send back a success message with a 200 status code
        res.status(200).json({ message: "item was deleted" });
    } catch (err) {
        // Log error to the console
        console.error("There was an error deleting", err);
        // Send back a 400 status code with the error message
        res.status(400).json({ error: err.message });
    }
});