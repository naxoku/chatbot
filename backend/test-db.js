const dns = require('dns').promises;

async function testDNS() {
  try {
    const addresses = await dns.lookup('aws-1-us-east-2.pooler.supabase.com');
    console.log('DNS resolved to:', addresses);
  } catch (err) {
    console.error('DNS lookup failed:', err.message);
  }
}

testDNS();