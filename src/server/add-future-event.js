/**
 * Add sample upcoming event to the database for testing
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function addFutureEvent() {
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
    
    // Find a template to duplicate
    const templateToClone = await collection.findOne({ name: 'D\'Mondfee' });
    
    if (!templateToClone) {
      console.log('❌ Could not find the template to clone');
      return;
    }
    
    // Create a future date (3 months from now)
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    
    // Create an event date object with the future date
    const eventDateObj = {
      start: futureDate,
      end: new Date(futureDate.getTime() + 60 * 60 * 1000), // 1 hour later
      eventDateString: futureDate.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    // Clone the template and update the event dates
    const newTemplate = { ...templateToClone };
    newTemplate._id = "2026w"; // Use a new ID for the new template
    newTemplate.name = "D'Mondfee 2026 - TESTING";
    
    // Either add to existing event dates or create new array
    if (newTemplate.eventDates && Array.isArray(newTemplate.eventDates)) {
      newTemplate.eventDates.push(eventDateObj);
    } else {
      newTemplate.eventDates = [eventDateObj];
    }
    
    // Insert the new template
    await collection.insertOne(newTemplate);
    console.log('✅ Added new future event with date:', futureDate.toISOString());
    
  } catch (error) {
    console.error('❌ MongoDB error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

addFutureEvent().catch(console.error);