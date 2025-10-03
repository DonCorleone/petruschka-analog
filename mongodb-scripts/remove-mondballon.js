// MongoDB Script: Remove "Tournee" flag from "Der Mondballon"
// This script removes the "Tournee" classification from Der Mondballon without deleting it

// Connect to your MongoDB database
// Use this script in MongoDB Compass or mongo shell

// Remove only "Tournee" from googleAnalyticsTracker for "Der Mondballon", keep other flags like "Premiere"
db.Gigs.updateMany(
  {
    "name": { $regex: "Der Mondballon", $options: "i" },
    "googleAnalyticsTracker": { $regex: "Tournee", $options: "i" }
  },
  [
    {
      $set: {
        "googleAnalyticsTracker": {
          $trim: {
            input: {
              $replaceAll: {
                input: {
                  $replaceAll: {
                    input: "$googleAnalyticsTracker",
                    find: "|Tournee",
                    replacement: ""
                  }
                },
                find: "Tournee|",
                replacement: ""
              }
            }
          }
        }
      }
    }
  ]
);

// Simpler alternative: Manual replacement for specific cases
// If the above complex aggregation doesn't work, use this simpler approach:
// db.Gigs.updateMany(
//   {
//     "name": { $regex: "Der Mondballon", $options: "i" },
//     "googleAnalyticsTracker": "Premiere|Tournee"
//   },
//   {
//     $set: {
//       "googleAnalyticsTracker": "Premiere"
//     }
//   }
// );

// Or if you want to set it as inactive:
// db.Gigs.updateMany(
//   {
//     "name": { $regex: "Der Mondballon", $options: "i" }
//   },
//   {
//     $set: {
//       "active": false,
//       "showInMerch": false
//     }
//   }
// );

console.log("Der Mondballon Tournee flag removal script executed");

// Verify the changes
db.Gigs.find({ "name": { $regex: "Der Mondballon", $options: "i" } }, { name: 1, googleAnalyticsTracker: 1, active: 1 }).pretty();