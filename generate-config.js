const fs = require("fs");

const config = `
window.CHOWDAQUEST_CONFIG = {
  SUPABASE_URL: "${process.env.SUPABASE_URL}",
  SUPABASE_ANON_KEY: "${process.env.SUPABASE_ANON_KEY}"
};
`;

fs.writeFileSync("./src/config.js", config);
