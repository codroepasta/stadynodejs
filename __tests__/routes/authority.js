const supertest = require("../common/supertest");

const { t_m_user } = require("../data/mockup")(true, {
  t_m_user: { activate: 1 },
});

module.exports = async (app) => {
  const routes = {
    "/authority": {
      "/list": {
        GET: t_m_user.map((user) => {
          const code = 200;
          return {
            id: user.login_id,
            path: "/authority/list",
            code,
            descriptions: [code, `id:${user.login_id}`],
            headers: [],
            send: null,
            user,
            callback: null,
          };
        }),
      },
    },
  };

  await supertest(app, routes);
};
