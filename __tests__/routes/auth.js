const supertest = require("../common/supertest");

const { t_m_user } = require("../data/mockup")(false);

module.exports = async (app) => {
  const routes = {
    "/auth": {
      "/token": {
        POST: t_m_user.map((user) => {
          const code =
            user.activate === 1 && user.deleted_date === null ? 200 : 401;
          return {
            id: user.login_id,
            path: "/auth/token",
            code,
            descriptions: [code, `id:${user.login_id}`],
            headers: [],
            send: { username: user.login_id, password: user.password },
            user: null,
            callback: null,
          };
        }),
      },
    },
  };

  await supertest(app, routes);
};
