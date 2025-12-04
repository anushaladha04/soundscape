// API Testing Script for Soundscape
// Run with: node test-api.js

const BASE_URL = 'http://localhost:5050';

let authToken = '';
let testUserId = '';

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
      log(colors.blue, `  Genres: ${data.user.genre_pref.join(', ')}`);
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
  console.log('='.repeat(60));

  const results = {
    passed: 0,
    failed: 0,
  };

  // Test suite
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testRegister },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Update Genre Preferences', fn: testUpdateGenrePreferences },
    { name: 'Get Recommendations', fn: testGetRecommendations },
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
    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between tests
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

