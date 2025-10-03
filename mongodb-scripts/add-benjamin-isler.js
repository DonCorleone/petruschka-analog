// MongoDB Script: Add Benjamin Isler to team
// This script adds Benjamin Isler as a new team member

// Connect to your MongoDB database
// Execute this script in MongoDB Compass or mongo shell

// Add Benjamin Isler to the team
// Note: You mentioned uncertainty about photo/text - adjust as needed
db.TeamMembers.insertOne({
  "name": "Benjamin Isler",
  "role": "Team Member", // Adjust role as appropriate
  "description": "PLACEHOLDER - Description text to be provided", // Replace with actual description
  "image": "benjamin-isler.jpg", // Placeholder for photo
  "email": "", // Add if available
  "order": 10, // Adjust display order
  "active": true,
  "category": "team" // Adjust category as needed
});

// Alternative: Use upsert to update if exists, create if not
db.TeamMembers.replaceOne(
  { "name": "Benjamin Isler" },
  {
    "name": "Benjamin Isler",
    "role": "Team Member",
    "description": "PLACEHOLDER - Description text to be provided",
    "image": "benjamin-isler.jpg",
    "order": 10,
    "active": true
  },
  { upsert: true }
);

console.log("Benjamin Isler addition script executed");

// Verify the addition
db.TeamMembers.find({ "name": "Benjamin Isler" }).pretty();

// Note: Update the role, description, and image path once you have the details from Nathalie