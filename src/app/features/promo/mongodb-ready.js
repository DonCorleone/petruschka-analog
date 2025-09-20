// MongoDB-ready escaped HTML string
const description = "<p>Figurenspiel, Bühnenbau, Figurenbau</p> <p>Arrangiert seit 2025 zusammen mit Regula Auf der Maur bestehende Stücke von Marianne Hofer für neue Produktionen</p> <p>Figurenspieltherapeutin mit eigener Praxis in Beromünster (<a href=\"https://www.arthos-traumwerkstatt.ch\" target=\"_blank\" rel=\"noopener\">www.arthos-traumwerkstatt.ch</a>)</p> <p>Langjährige Dozentin für Figurenbau und Figurenspiel an der PH Luzern</p> <p>Dipl. Kindergärtnerin und Mutter von drei erwachsneren Kindern</p> <p>Sie arrangiert die jeweiligen Hörspiel-CD`s zu den einzelnen Winterstücken oder Wandertheaterstücken des Figurentheaters PETRUSCHKA und gibt allen Figuren eine Stimme.</p> <p>Sie spielt bei den Winterstücken und im Wandertheater PETRUSCHKA mit.</p>";

// Example MongoDB update operation
db.collection('bandMembers').updateOne(
  { name: 'Member Name' }, 
  { $set: { description: description } }
);

// For use in API/code:
const memberData = {
  name: "Member Name",
  description: description,
  // other fields...
};