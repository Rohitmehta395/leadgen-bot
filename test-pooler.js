const { Pool } = require('pg');
const regions = ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-central-1', 'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'sa-east-1', 'ca-central-1'];

async function main() {
  for (const region of regions) {
    const pool = new Pool({
      connectionString: `postgresql://postgres.ysbjavklszlerwrmjkts:9nI9gn76ftT1NJ3a@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
    });
    try {
      await pool.query('SELECT 1');
      console.log(region + ': success');
    } catch (e) {
      console.log(region + ': ' + e.message);
    } finally {
      await pool.end();
    }
  }
}

main();
