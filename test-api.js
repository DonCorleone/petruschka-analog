/**
 * Simple test script to call the gigs API directly
 */
const http = require('http');

// Make a request to the local API endpoint
const options = {
  hostname: 'localhost',
  port: 5175,
  path: '/api/v1/gigs',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(data);
      console.log('API Response:');
      console.log(`Success: ${jsonResponse.success}`);
      console.log(`Timestamp: ${jsonResponse.timestamp}`);
      console.log(`Number of gigs returned: ${jsonResponse.data.length}`);
      
      if (jsonResponse.data.length > 0) {
        console.log('\nFirst gig details:');
        const gig = jsonResponse.data[0];
        console.log(`ID: ${gig.id}`);
        console.log(`Title: ${gig.title}`);
        console.log(`Date: ${gig.date.day}-${gig.date.month}-${gig.date.year}`);
        console.log(`Time: ${gig.time}`);
        console.log(`Venue: ${gig.venue}`);
        console.log(`Description: ${gig.description}`);
      } else {
        console.log('\nNo gigs found in the response.');
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();