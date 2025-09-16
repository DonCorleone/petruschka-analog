// MongoDB shell queries for finding upcoming gigs
// You can run these in MongoDB Compass directly

// 1. Basic query to find all gigs with CD|Tournee in googleAnalyticsTracker
// This is equivalent to the main query used in gigs.ts
db.Gigs.find({ 
  "googleAnalyticsTracker": { $regex: "CD|Tournee", $options: "i" } 
});

// 1b. Query to find ALL gigs regardless of googleAnalyticsTracker value
// This will show us what values actually exist in your database
db.Gigs.find({}, {
  "_id": 1,
  "name": 1, 
  "googleAnalyticsTracker": 1
});

// 2. Check if there are any documents with eventDates that have a start date
db.Gigs.find({ 
  "eventDates.start": { $exists: true } 
});

// 3. Find upcoming events (events with start date in the future)
// Use $expr to compare with current date
db.Gigs.find({ 
  $and: [
    // REMOVED the googleAnalyticsTracker filter to include ALL event types
    { "eventDates": { $exists: true, $ne: [] } },
    { "eventDates.start": { $gt: new Date() } }
  ]
});

// 4. Aggregate pipeline to unwind the eventDates array and filter for future dates
// This is more powerful and will examine each event date individually
db.Gigs.aggregate([
  // First match documents with eventDates (no filter on googleAnalyticsTracker)
  { $match: { 
    "eventDates": { $exists: true, $ne: [] }
  }},
  // Unwind the eventDates array to get one document per event date
  { $unwind: "$eventDates" },
  // Match only future event dates
  { $match: { 
    "$expr": { 
      "$gt": [
        { "$cond": [
          { "$eq": [{ "$type": "$eventDates.start" }, "date"] },
          "$eventDates.start",
          { "$cond": [
            { "$eq": [{ "$type": "$eventDates.start" }, "object"] },
            { "$toDate": "$eventDates.start.$date" },
            { "$toDate": "$eventDates.start" }
          ]}
        ]},
        new Date()
      ]
    }
  }},
  // Project only the relevant fields
  { $project: {
    _id: 1,
    name: 1,
    location: 1,
    eventDate: "$eventDates.start",
    eventDateString: "$eventDates.eventDateString",
    googleAnalyticsTracker: 1
  }}
]);

// 5. If you want to check the structure of all eventDates to understand date formats
db.Gigs.find({
  "eventDates": { $exists: true }
}, {
  _id: 1,
  name: 1,
  "eventDates": 1
});

// 6. Count how many events are upcoming vs. past
// First, count documents with eventDates (events total)
db.Gigs.count({ 
  "googleAnalyticsTracker": { $regex: "CD|Tournee", $options: "i" },
  "eventDates": { $exists: true } 
});

// Then use aggregate to count upcoming events
db.Gigs.aggregate([
  { $match: { 
    "googleAnalyticsTracker": { $regex: "CD|Tournee", $options: "i" },
    "eventDates": { $exists: true, $ne: [] }
  }},
  { $unwind: "$eventDates" },
  { $match: { 
    "$expr": { 
      "$gt": [
        { "$cond": [
          { "$eq": [{ "$type": "$eventDates.start" }, "date"] },
          "$eventDates.start",
          { "$cond": [
            { "$eq": [{ "$type": "$eventDates.start" }, "object"] },
            { "$toDate": "$eventDates.start.$date" },
            { "$toDate": "$eventDates.start" }
          ]}
        ]},
        new Date()
      ]
    }
  }},
  { $count: "upcomingEventsCount" }
]);

// 7. Get all distinct values of googleAnalyticsTracker field
// This will help understand what values are actually in the database
db.Gigs.distinct("googleAnalyticsTracker");

// 8. To add a future event for testing (if needed)
// Make sure to set the date to a future date
db.Gigs.insertOne({
  "_id": "2026w",
  "name": "D'Mondfee 2026 - TEST EVENT",
  "googleAnalyticsTracker": "Tournee",
  "location": "Petruschka Theater",
  "eventDates": [
    {
      "start": new Date(new Date().getTime() + 90*24*60*60*1000), // 90 days in the future
      "end": new Date(new Date().getTime() + 90*24*60*60*1000 + 60*60*1000), // 1 hour later
      "eventDateString": "Future Date"
    }
  ]
});