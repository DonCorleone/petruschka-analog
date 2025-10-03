// MongoDB Script: Deactivate team members as specified
// This script sets specified team members as inactive instead of deleting them

// Connect to your MongoDB database
// Execute this script in MongoDB Compass or mongo shell

// 1. Deactivate Marianne
db.staff.updateMany(
  { "name": { $regex: "Marianne", $options: "i" } },
  { $set: { "active": false } }
);

// 2. Deactivate Elmar
db.staff.updateMany(
  { "name": { $regex: "Elmar", $options: "i" } },
  { $set: { "active": false } }
);

// 3. Deactivate Evamaria Felder
db.staff.updateMany(
  { "name": { $regex: "Evamaria Felder", $options: "i" } },
  { $set: { "active": false } }
);

// Alternative single name search if needed:
db.staff.updateMany(
  { "name": { $regex: "Evamaria", $options: "i" } },
  { $set: { "active": false } }
);

// 4. Deactivate all musicians by their instruments in the topic field
// This deactivates anyone with specific instruments like "flöte", "klavier", "cello" in their topic
db.staff.updateMany(
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
db.staff.updateMany(
  { "name": { $regex: "Andreas Guillomen", $options: "i" } },
  { $set: { "active": false } }
);

// Alternative broader search for Andreas if needed:
db.staff.updateMany(
  { "name": { $regex: "Andreas", $options: "i" } },
  { $set: { "active": false } }
);

console.log("Staff deactivation script executed");

// Show all staff members with their active status to verify
console.log("All staff members with status:");
db.staff.find({}, { name: 1, role: 1, topic: 1, active: 1 }).pretty();

console.log("Active staff members only:");
db.staff.find({ "active": true }, { name: 1, role: 1, topic: 1 }).pretty();