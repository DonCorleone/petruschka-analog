// MongoDB Script: Update Nathalie Hildebrand-Isler
// This script updates Nathalie's information to reflect her new role as Co-Leiterin

// Connect to your MongoDB database
// Execute this script in MongoDB Compass or mongo shell

// Update Nathalie Hildebrand Isler with new information and Co-Leader role
db.staff.updateOne(
  { "_id": ObjectId("5fefa3cc10b02e457ef6473a") },
  {
    $set: {
      "name": "Nathalie Hildebrand Isler",
      "bio": "<p>Co-Leiterin Figurentheater, Figurenspiel, Bühnenbau, Figurenbau</p> <p>Arrangiert seit 2025 zusammen mit Regula Auf der Maur bestehende Stücke von Marianne Hofer für neue Produktionen und ist Co-Leiterin des Figurentheaters Petruschka.</p> <p>Figurenspieltherapeutin mit eigener Praxis in Beromünster (<a href=\"https://www.arthos-traumwerkstatt.ch\" target=\"_blank\" rel=\"noopener\">www.arthos-traumwerkstatt.ch</a>)</p> <p>Langjährige Dozentin für Figurenbau und Figurenspiel an der PH Luzern</p> <p>Dipl. Kindergärtnerin und Mutter von drei erwachsenen Kindern</p> <p>Sie arrangiert die jeweiligen Hörspiel-CD`s zu den einzelnen Winterstücken oder Wandertheaterstücken des Figurentheaters PETRUSCHKA und gibt allen Figuren eine Stimme.</p> <p>Sie spielt bei den Winterstücken und im Wandertheater PETRUSCHKA mit.</p>",
      "topic": "Co-Leitung & Figurenspiel",
      "sortOrder": 2, // Second position after Regula
      "active": true
    }
  }
);

console.log("Nathalie update script executed");

// Verify the update
db.staff.find({ "name": { $regex: "Nathalie", $options: "i" } }, { name: 1, bio: 1, topic: 1, sortOrder: 1, active: 1 }).pretty();