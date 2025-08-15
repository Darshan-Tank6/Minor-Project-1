const { startEmailReader } = require("./emailReader");

async function startServer() {
  // await connectDB2();
  startEmailReader();
}

// if (require.main === module) {
//   // This only runs when you execute: node server.js
//   startServer();
// }

module.exports = { startServer };
