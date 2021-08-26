const api = require("../api");

describe("/", () => {
  (async () => {
    await require("./routes/index")(api);
    await require("./routes/auth")(api);
    await require("./routes/authority")(api);
  })();
});
