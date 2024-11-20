// Convert string ID to ObjectId
const objectId = new ObjectId(id);

// Update the document
const result = await collection.findOneAndUpdate(
    { _id: objectId },           // Filter
    { $set: updateData },        // Update operation
    {
        returnDocument: 'after', // Return the updated document
        upsert: false            // Do not create a new document if one doesn't match
    }
);