// MongoDB Script: Update Regula Auf der Maur
// This script updates Regula's information to reflect her new role as Co-Leiterin

// Connect to your MongoDB database
// Execute this script in MongoDB Compass or mongo shell

// Update Regula Auf der Maur with new information
db.staff.updateOne(
  { "_id": ObjectId("5fefa3cc10b02e457ef64737") },
  {
    $set: {
      "name": "Regula Auf der Maur",
      "bio": "<p>Co-Leiterin Figurentheater und Figurenspielerin</p><p>Ist fürs Figurenspiel, Bühnenbau und Anmaldungen Schülervorstellungen verantwortlich. Sie arrangiert seit 2025 zusammen mit Nathalie Hildebrand-Isler bestehende Stücke von Marianne Hofer für neue Produktionen und ist Co-Leiterin des Figurentheaters Petruschka.</p><p>Ebenso ist sie Dipl. Kindergartenlehrperson, Dipl. Figurenspieltherapeutin und Dipl. Psychomotoriktherapeutin und Dozentin für Figurenspiel an der Pädagogischen Hochschule Luzern. Lebenskünstlerin, Reisende und Mutter von zwei erwachsenen Kindern.</p>",
      "topic": "Co-Leitung & Figurenspiel",
      "sortOrder": 1, // Move to top as Co-Leader
      "active": true
    }
  }
);

// Alternative: Update by name if ObjectId approach doesn't work
db.staff.updateOne(
  { "name": { $regex: "Regula Auf der Maur", $options: "i" } },
  {
    $set: {
      "bio": "<p>Co-Leiterin Figurentheater und Figurenspielerin</p><p>Ist fürs Figurenspiel, Bühnenbau und Anmaldungen Schülervorstellungen verantwortlich. Sie arrangiert seit 2025 zusammen mit Nathalie Hildebrand-Isler bestehende Stücke von Marianne Hofer für neue Produktionen und ist Co-Leiterin des Figurentheaters Petruschka.</p><p>Ebenso ist sie Dipl. Kindergartenlehrperson, Dipl. Figurenspieltherapeutin und Dipl. Psychomotoriktherapeutin und Dozentin für Figurenspiel an der Pädagogischen Hochschule Luzern. Lebenskünstlerin, Reisende und Mutter von zwei erwachsenen Kindern.</p>",
      "topic": "Co-Leitung & Figurenspiel",
      "sortOrder": 1
    }
  }
);

console.log("Regula update script executed");

// Verify the update
db.staff.find({ "name": { $regex: "Regula", $options: "i" } }, { name: 1, bio: 1, topic: 1, sortOrder: 1, active: 1 }).pretty();