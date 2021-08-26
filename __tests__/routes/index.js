const supertest = require("supertest");
const description = require("../common/description");

module.exports = (app) => {
  describe("GET", () => {
    const code = 200;
    it(description(code), async () => {
      await supertest(app).get("/").expect("Content-Type", /json/).expect(code);
    });
  });
};
