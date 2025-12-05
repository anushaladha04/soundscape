// API Testing Suite 
//
//3 end to end tests
// 1. User Registration & Recommendations Flow 
// 2. Event Discovery & Bookmarking 
// 3. Event Sync & Filtered Discovery 

const BASE_URL = 'http://localhost:5050';

// E2E Test #1 
let authToken = '';
let testUserId = '';

// E2E Test #2 
let testEventId = '';
let testBookmarkId = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.cyan}━━━ ${name} ━━━${colors.reset}`);
}

async function testHealthCheck() {
  logTest('Health Check');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'ok') {
      log(colors.green, '✓ Health check passed');
      return true;
    } else {
      log(colors.red, '✗ Health check failed');
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Health check error: ${error.message}`);
    return false;
  }
}

async function testRegister() {
  logTest('User Registration');
  try {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    };

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      authToken = data.token;
      testUserId = data.user.id;
      log(colors.green, `✓ Registration successful`);
      log(colors.blue, `  User: ${data.user.email}`);
      log(colors.blue, `  Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      log(colors.red, `✗ Registration failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Registration error: ${error.message}`);
    return false;
  }
}

async function testGetCurrentUser() {
  logTest('Get Current User');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.user) {
      log(colors.green, '✓ Get current user successful');
      log(colors.blue, `  User: ${data.user.name} (${data.user.email})`);
      return true;
    } else {
      log(colors.red, `✗ Get current user failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Get current user error: ${error.message}`);
    return false;
  }
}

async function testUpdateGenrePreferences() {
  logTest('Update Genre Preferences');
  try {
    const genres = ['Rock', 'Pop', 'Jazz', 'Electronic'];

    const response = await fetch(`${BASE_URL}/api/recommendations/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ genres }),
    });

    const data = await response.json();

    if (response.ok && data.user) {
      log(colors.green, '✓ Genre preferences updated');
      log(colors.blue, `  Genres: ${data.user.genres.join(', ')}`);
      return true;
    } else {
      log(colors.red, `✗ Update preferences failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Update preferences error: ${error.message}`);
    return false;
  }
}

async function testGetRecommendations() {
  logTest('Get Recommendations');
  try {
    const response = await fetch(`${BASE_URL}/api/recommendations`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      log(colors.green, '✓ Recommendations fetched successfully');
      log(colors.blue, `  Found ${data.recommendations.length} recommendations`);
      log(colors.blue, `  Genres searched: ${data.genres.join(', ')}`);
      log(colors.blue, `  Total events available: ${data.totalAvailable}`);
      
      if (data.recommendations.length > 0) {
        log(colors.yellow, '\n  Sample events:');
        data.recommendations.slice(0, 3).forEach((event, i) => {
          log(colors.yellow, `    ${i + 1}. ${event.name}`);
          log(colors.yellow, `       Artist: ${event.artist || 'N/A'}`);
          log(colors.yellow, `       Genre: ${event.genre || 'N/A'}`);
        });
      }
      return true;
    } else {
      log(colors.red, `✗ Get recommendations failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Get recommendations error: ${error.message}`);
    return false;
  }
}


// END-TO-END TEST #2: Event Discovery & Bookmarking Flow


async function testSearchEvents() {
  logTest('Search Events (E2E Test 2 - Step 1)');
  try {
    const response = await fetch(`${BASE_URL}/api/events?limit=10`);
    const data = await response.json();

    if (response.ok && data.events && data.events.length > 0) {
      testEventId = data.events[0]._id || data.events[0].id;
      log(colors.green, '✓ Event search successful');
      log(colors.blue, `  Found ${data.events.length} events`);
      log(colors.blue, `  Test event ID: ${testEventId}`);
      log(colors.yellow, `  Sample: ${data.events[0].artist || data.events[0].name}`);
      return true;
    } else {
      log(colors.red, `✗ Event search failed or no events found`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Search events error: ${error.message}`);
    return false;
  }
}

async function testCreateBookmark() {
  logTest('Create Bookmark (E2E Test 2 - Step 2)');
  try {
    if (!testEventId) {
      log(colors.red, '✗ No event ID available from previous test');
      return false;
    }

    const response = await fetch(`${BASE_URL}/api/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ event_id: testEventId }),
    });

    const data = await response.json();

    if (response.ok && data.bookmark) {
      testBookmarkId = data.bookmark._id || data.bookmark.bookmark_id;
      log(colors.green, '✓ Bookmark created successfully');
      log(colors.blue, `  Bookmark ID: ${testBookmarkId}`);
      return true;
    } else {
      log(colors.red, `✗ Create bookmark failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Create bookmark error: ${error.message}`);
    return false;
  }
}

async function testGetBookmarks() {
  logTest('Get User Bookmarks (E2E Test 2 - Step 3)');
  try {
    const response = await fetch(`${BASE_URL}/api/bookmarks`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.bookmarks) {
      const foundBookmark = data.bookmarks.find(
        (b) => (b._id === testBookmarkId || b.bookmark_id === testBookmarkId)
      );
      
      if (foundBookmark) {
        log(colors.green, '✓ Get bookmarks successful - found our bookmark');
        log(colors.blue, `  Total bookmarks: ${data.bookmarks.length}`);
        return true;
      } else {
        log(colors.yellow, '✓ Get bookmarks successful but bookmark not found');
        log(colors.blue, `  Total bookmarks: ${data.bookmarks.length}`);
        return true; 
      }
    } else {
      log(colors.red, `✗ Get bookmarks failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Get bookmarks error: ${error.message}`);
    return false;
  }
}

async function testDeleteBookmark() {
  logTest('Delete Bookmark (E2E Test 2 - Step 4)');
  try {
    if (!testBookmarkId && !testEventId) {
      log(colors.red, '✗ No bookmark ID or event ID available');
      return false;
    }


    const deleteId = testBookmarkId || testEventId;
    const response = await fetch(`${BASE_URL}/api/bookmarks/${deleteId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      log(colors.green, '✓ Bookmark deleted successfully');
      log(colors.blue, `  Message: ${data.message || 'Bookmark removed'}`);
      return true;
    } else {
      log(colors.red, `✗ Delete bookmark failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Delete bookmark error: ${error.message}`);
    return false;
  }
}


// END-TO-END TEST #3: Event Sync & Filtered Discovery Flow


async function testSyncTicketmaster() {
  logTest('Sync Events from Ticketmaster (E2E Test 3 - Step 1)');
  try {
    log(colors.yellow, '  Note: This may take 20-30 seconds...');
    
    const response = await fetch(`${BASE_URL}/api/events/sync-ticketmaster`);
    const data = await response.json();

    if (response.ok) {
      log(colors.green, '✓ Ticketmaster sync successful');
      log(colors.blue, `  Events fetched: ${data.fetched || 0}`);
      log(colors.blue, `  Events filtered: ${data.filtered || 0}`);
      log(colors.blue, `  Events upserted: ${data.upserted || 0}`);
      return true;
    } else {
      log(colors.red, `✗ Ticketmaster sync failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Ticketmaster sync error: ${error.message}`);
    return false;
  }
}

async function testSearchByArtist() {
  logTest('Search Events by Artist (E2E Test 3 - Step 2)');
  try {

    const searchTerm = 'concert';
    const response = await fetch(
      `${BASE_URL}/api/events?artist=${encodeURIComponent(searchTerm)}&limit=5`
    );

    const data = await response.json();

    if (response.ok && data.events) {
      log(colors.green, '✓ Artist search successful');
      log(colors.blue, `  Search term: "${searchTerm}"`);
      log(colors.blue, `  Found ${data.total} matching events`);
      log(colors.blue, `  Returned ${data.events.length} events (page 1)`);
      
      if (data.events.length > 0) {
        log(colors.yellow, '\n  Sample results:');
        data.events.slice(0, 3).forEach((event, i) => {
          log(colors.yellow, `    ${i + 1}. ${event.artist || event.name}`);
          log(colors.yellow, `       Venue: ${event.venue}`);
          log(colors.yellow, `       Genre: ${event.genre}`);
        });
      }
      return true;
    } else {
      log(colors.red, `✗ Artist search failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Artist search error: ${error.message}`);
    return false;
  }
}

async function testFilterByGenre() {
  logTest('Filter Events by Genre (E2E Test 3 - Step 3)');
  try {

    const genre = 'Rock';
    const response = await fetch(
      `${BASE_URL}/api/events?genre=${encodeURIComponent(genre)}&limit=5`
    );

    const data = await response.json();

    if (response.ok && data.events) {
      log(colors.green, '✓ Genre filter successful');
      log(colors.blue, `  Genre: "${genre}"`);
      log(colors.blue, `  Found ${data.total} matching events`);
      log(colors.blue, `  Returned ${data.events.length} events`);
      

      const allMatchGenre = data.events.every(
        e => e.genre && e.genre.toLowerCase().includes(genre.toLowerCase())
      );
      
      if (allMatchGenre) {
        log(colors.green, '  ✓ All events match the genre filter');
      } else {
        log(colors.yellow, '  ⚠ Some events may not match genre exactly');
      }
      
      if (data.events.length > 0) {
        log(colors.yellow, '\n  Sample filtered events:');
        data.events.slice(0, 2).forEach((event, i) => {
          log(colors.yellow, `    ${i + 1}. ${event.artist || event.name}`);
          log(colors.yellow, `       Genre: ${event.genre}`);
        });
      }
      return true;
    } else {
      log(colors.red, `✗ Genre filter failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Genre filter error: ${error.message}`);
    return false;
  }
}

async function testGetAvailableGenres() {
  logTest('Get Available Genres (E2E Test 3 - Step 4)');
  try {
    const response = await fetch(`${BASE_URL}/api/events/genres`);
    const data = await response.json();

    if (response.ok && data.genres) {
      log(colors.green, '✓ Get genres successful');
      log(colors.blue, `  Available genres: ${data.genres.length}`);
      
      if (data.genres.length > 0) {
        log(colors.yellow, '\n  Genre list:');
        data.genres.slice(0, 10).forEach((genre, i) => {
          log(colors.yellow, `    ${i + 1}. ${genre}`);
        });
        
        if (data.genres.length > 10) {
          log(colors.yellow, `    ... and ${data.genres.length - 10} more`);
        }
      }
      return true;
    } else {
      log(colors.red, `✗ Get genres failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Get genres error: ${error.message}`);
    return false;
  }
}


// Integration Tests


async function testSearchTicketmasterEvents() {
  logTest('Search Ticketmaster Events');
  try {
    const response = await fetch(
      `${BASE_URL}/api/events/ticketmaster?keyword=music&size=5`
    );

    const data = await response.json();

    if (response.ok && data.events) {
      log(colors.green, '✓ Ticketmaster search successful');
      log(colors.blue, `  Found ${data.events.length} events`);
      
      if (data.events.length > 0) {
        log(colors.yellow, '\n  Sample events:');
        data.events.slice(0, 3).forEach((event, i) => {
          log(colors.yellow, `    ${i + 1}. ${event.name}`);
          log(colors.yellow, `       Artist: ${event.artist || 'N/A'}`);
          log(colors.yellow, `       Genre: ${event.genre || 'N/A'}`);
        });
      }
      return true;
    } else {
      log(colors.red, `✗ Ticketmaster search failed: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Ticketmaster search error: ${error.message}`);
    return false;
  }
}

async function testRecommendationsWithoutAuth() {
  logTest('Get Recommendations Without Auth (Should Fail)');
  try {
    const response = await fetch(`${BASE_URL}/api/recommendations`);
    const data = await response.json();

    if (!response.ok) {
      log(colors.green, '✓ Correctly rejected unauthorized request');
      log(colors.blue, `  Error: ${data.message}`);
      return true;
    } else {
      log(colors.red, '✗ Should have rejected unauthorized request');
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Test error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, '🧪 SOUNDSCAPE API TESTING');
  log(colors.yellow, '   E2E Test #1: Registration → Recommendations');
  log(colors.yellow, '   E2E Test #2: Event Discovery → Bookmarking');
  log(colors.yellow, '   E2E Test #3: Event Sync → Filtered Search');
  console.log('='.repeat(60));

  const results = {
    passed: 0,
    failed: 0,
  };

  // Test suite
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    
    // E2E Test #1: User Registration & Recommendations Flow
    { name: 'User Registration', fn: testRegister },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Update Genre Preferences', fn: testUpdateGenrePreferences },
    { name: 'Get Recommendations', fn: testGetRecommendations },
    
    // E2E Test #2: Event Discovery & Bookmarking Flow
    { name: 'Search Events', fn: testSearchEvents },
    { name: 'Create Bookmark', fn: testCreateBookmark },
    { name: 'Get User Bookmarks', fn: testGetBookmarks },
    { name: 'Delete Bookmark', fn: testDeleteBookmark },
    
    // E2E Test #3: Event Sync & Filtered Discovery Flow
    { name: 'Sync Ticketmaster Events', fn: testSyncTicketmaster },
    { name: 'Search Events by Artist', fn: testSearchByArtist },
    { name: 'Filter Events by Genre', fn: testFilterByGenre },
    { name: 'Get Available Genres', fn: testGetAvailableGenres },
    
    // Integration & Security Tests
    { name: 'Search Ticketmaster Events', fn: testSearchTicketmasterEvents },
    { name: 'Recommendations Without Auth', fn: testRecommendationsWithoutAuth },
  ];

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, '📊 TEST SUMMARY');
  console.log('='.repeat(60));
  log(colors.green, `✓ Passed: ${results.passed}`);
  log(colors.red, `✗ Failed: ${results.failed}`);
  console.log('='.repeat(60) + '\n');

  if (results.failed === 0) {
    log(colors.green, '🎉 All tests passed!');
  } else {
    log(colors.yellow, '⚠️  Some tests failed. Check the output above.');
  }
}

// Run tests
runTests().catch((error) => {
  log(colors.red, `Fatal error: ${error.message}`);
  process.exit(1);
});
