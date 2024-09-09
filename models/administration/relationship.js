const mongoose = require("mongoose");
const { Schema } = mongoose;

const relationshipSchema = new Schema({
  relationshipId: { type: String },
  relationship: { type: String },
});

const collection = "relationships";

const RelationshipModel = mongoose.model(
  "Relationship",
  relationshipSchema,
  collection
);
module.exports = RelationshipModel;
