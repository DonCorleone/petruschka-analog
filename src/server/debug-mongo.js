/**
 * Debug script to check MongoDB for upcoming gigs
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function debugMongo() {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  if (!connectionString) {
    console.log('❌ No MongoDB connection string found');
    return;
  }

  let client = null;
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(connectionString);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('eventDb');
    const collection = db.collection('Gigs');
    
    // 1. Check raw count
    const totalCount = await collection.countDocuments();
    console.log(`Total documents in collection: ${totalCount}`);
    
    // 2. Check gigs with eventDates
    const withEventDates = await collection.countDocuments({ eventDates: { $exists: true, $ne: [] } });
    console.log(`Documents with eventDates: ${withEventDates}`);
    
    // 3. Check gigs with googleAnalyticsTracker containing CD|Tournee
    const query = { 'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" } };
    const withTracker = await collection.countDocuments(query);
    console.log(`Documents with CD|Tournee tracker: ${withTracker}`);
    
    // 4. Find upcoming gigs - gigs with event dates in the future
    const now = new Date();
    console.log(`Current date for comparison: ${now.toISOString()}`);
    
    // First approach: Find docs with eventDates.start > now
    const pipeline = [
      { $match: { eventDates: { $exists: true, $ne: [] } } },
      { $unwind: "$eventDates" },
      { 
        $match: { 
          "eventDates.start": { $gt: now } 
        } 
      },
      { $count: "upcomingEventsCount" }
    ];
    
    const upcomingAgg = await collection.aggregate(pipeline).toArray();
    console.log("Upcoming events count (using aggregation):", upcomingAgg[0]?.upcomingEventsCount || 0);
    
    // 5. Check the structure of the eventDates field in a sample document
    const sampleDoc = await collection.findOne({ eventDates: { $exists: true, $ne: [] } });
    console.log("\nSample document structure for eventDates:");
    console.log(JSON.stringify(sampleDoc.eventDates, null, 2));
    
    // 6. Check if there are any upcoming events using different date formats
    if (sampleDoc.eventDates && sampleDoc.eventDates.length > 0) {
      console.log("\nAnalyzing eventDates in sample document:");
      sampleDoc.eventDates.forEach((eventDate, index) => {
        console.log(`Event date ${index + 1}:`);
        
        if (eventDate.start) {
          console.log(`  Start date type: ${typeof eventDate.start}`);
          
          let parsedDate = null;
          if (eventDate.start instanceof Date) {
            parsedDate = eventDate.start;
            console.log(`  Parsed as Date object: ${parsedDate}`);
          } else if (eventDate.start.$date) {
            parsedDate = new Date(eventDate.start.$date);
            console.log(`  Parsed from $date: ${parsedDate}`);
          } else if (typeof eventDate.start === 'string') {
            parsedDate = new Date(eventDate.start);
            console.log(`  Parsed from string: ${parsedDate}`);
          } else if (typeof eventDate.start === 'number') {
            parsedDate = new Date(eventDate.start);
            console.log(`  Parsed from number: ${parsedDate}`);
          }
          
          if (parsedDate) {
            console.log(`  Is in future: ${parsedDate > now}`);
          }
        }
      });
    }
    
    // 7. Get a sample of actual upcoming gigs
    const upcomingGigs = await collection.aggregate([
      { $match: { eventDates: { $exists: true, $ne: [] } } },
      { $unwind: "$eventDates" },
      { 
        $match: { 
          "$or": [
            { "eventDates.start": { $gt: now } },
            { "eventDates.start.$date": { $gt: now.toISOString() } }
          ]
        } 
      },
      { $limit: 3 },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          eventDate: "$eventDates.start",
          googleAnalyticsTracker: 1
        }
      }
    ]).toArray();
    
    console.log("\nSample upcoming gigs:");
    console.log(JSON.stringify(upcomingGigs, null, 2));
    
  } catch (error) {
    console.error('❌ MongoDB error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

debugMongo().catch(console.error);