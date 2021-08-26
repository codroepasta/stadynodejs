const supertest = require("../common/supertest");

const { t_m_user } = require("../data/mockup")(true, {
  t_m_user: { activate: 1 },
});

let testUser = t_m_user.map((user, index) => {
  const no = index + 1;
  return {
    user,
    send: {
      login_id: `test_${no}`,
      password: "password",
      name: `TestUser${no}`,
      remark: `Create user: ${user.login_id}`,
    },
  };
});

module.exports = async (app) => {
  const routes = {
    "/user": {
      POST: testUser.map(({ user, send }) => {
        const code = 200;
        return {
          id: user.login_id,
          path: "/user",
          code,
          descriptions: [code, `id:${user.login_id}`],
          headers: [],
          send,
          user,
          callback: (e, res) => {
            // TODO : ユーザーを取得する処理を追加
          },
        };
      }),
    },
  };

  await supertest(app, routes);
};
