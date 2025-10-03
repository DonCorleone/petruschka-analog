// MongoDB Script: Deactivate team members as specified
// This script sets specified team members as inactive instead of deleting them

// Connect to your MongoDB database
// Execute this script in MongoDB Compass or mongo shell

// 1. Deactivate Marianne
db.TeamMembers.updateMany(
  { "name": { $regex: "Marianne", $options: "i" } },
  { $set: { "active": false } }
);

// 2. Deactivate Elmar
db.TeamMembers.updateMany(
  { "name": { $regex: "Elmar", $options: "i" } },
  { $set: { "active": false } }
);

// 3. Deactivate Evamaria Felder
db.TeamMembers.updateMany(
  { "name": { $regex: "Evamaria Felder", $options: "i" } },
  { $set: { "active": false } }
);

// Alternative single name search if needed:
db.TeamMembers.updateMany(
  { "name": { $regex: "Evamaria", $options: "i" } },
  { $set: { "active": false } }
);

// 4. Deactivate all musicians by their instruments in the topic field
// This deactivates anyone with specific instruments like "flöte", "klavier", "cello" in their topic
db.TeamMembers.updateMany(
  {
    $or: [
      { "topic": { $regex: "flöte", $options: "i" } },
      { "topic": { $regex: "klavier", $options: "i" } },
      { "topic": { $regex: "cello", $options: "i" } },
      { "topic": { $regex: "musik", $options: "i" } },
      { "role": { $regex: "musik", $options: "i" } }
    ]
  },
  { $set: { "active": false } }
);

// 5. Deactivate Andreas Guillomen specifically
db.TeamMembers.updateMany(
  { "name": { $regex: "Andreas Guillomen", $options: "i" } },
  { $set: { "active": false } }
);

// Alternative broader search for Andreas if needed:
db.TeamMembers.updateMany(
  { "name": { $regex: "Andreas", $options: "i" } },
  { $set: { "active": false } }
);

console.log("Team member deactivation script executed");

// Show all team members with their active status to verify
console.log("All team members with status:");
db.TeamMembers.find({}, { name: 1, role: 1, topic: 1, active: 1 }).pretty();

console.log("Active team members only:");
db.TeamMembers.find({ "active": true }, { name: 1, role: 1, topic: 1 }).pretty();