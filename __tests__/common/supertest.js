const st = require("supertest");
const config = require("../../common/config");
const description = require("../common/description");

module.exports = async (app, routes) => {
  const recursion = (obj, objCallback, methodCallback) => {
    return new Promise((resolve, reject) => {
      Object.entries(obj).forEach(([key, value]) => {
        const methodFlag = [
          "POST",
          "GET",
          "PUT",
          "DELETE",
          "HEAD",
          "CONNECT",
          "OPTIONS",
          "TRACE",
          "PATCH",
        ].some((method) => key === method);
        if (!methodFlag) {
          return objCallback(key, value, objCallback, methodCallback);
        } else {
          methodCallback(key, value, obj);
          resolve();
        }
      });
    });
  };

  await recursion(
    routes,
    (key, value, objCallback, methodCallback) =>
      recursion(value, objCallback, methodCallback),
    (method, values, obj) => {
      if (config.cors.enable) {
        const allow = values.map((value) => {
          const origin = "http://localhost";
          return {
            id: value.id,
            path: value.path,
            code: value.code,
            descriptions: [value.code, `id:${value.id}`, `origin:${origin}`],
            headers: value.headers.concat([["Origin", origin]]),
            send: value.send,
            user: value.user,
          };
        });
        const deny = values.map((value) => {
          const origin = "http://deny.com";
          const code = 403;
          return {
            id: value.id,
            path: value.path,
            code,
            descriptions: [code, `id:${value.id}`, `origin:${origin}`],
            headers: value.headers.concat([["Origin", origin]]),
            send: value.send,
            user: value.user,
          };
        });
        const none = values.map((value) => {
          const origin = "none";
          const code = 403;
          return {
            id: value.id,
            path: value.path,
            code,
            descriptions: [code, `id:${value.id}`, `origin:${origin}`],
            headers: value.headers,
            send: value.send,
            user: value.user,
          };
        });
        obj[method] = [...allow, ...deny, ...none];
      }
      if (config.maintenance.enable) {
        const code = 503;
        obj[method] = [
          {
            id: null,
            path: values[0].path,
            code,
            descriptions: [code, `id:none`, `origin:${config.cors.enable}`],
            headers: [],
            send: null,
            user: null,
          },
        ];
      }
    }
  );

  await recursion(
    routes,
    (key, value, objCallback, methodCallback) =>
      describe(key, () => recursion(value, objCallback, methodCallback)),
    (method, values) => {
      values.forEach(
        ({ path, code, descriptions, headers, send, user, callback }) => {
          it(description(...descriptions), async () => {
            try {
              let test = st(app)[method.toLowerCase()](path);
              if (user) {
                const authorization = (
                  await st(app)
                    .post("/auth/token")
                    .set("Origin", "http://localhost")
                    .send({
                      username: user.login_id,
                      password: user.password,
                    })
                ).body.body;
                test = test.set("Authorization", authorization);
              }
              headers.forEach(([key, value]) => {
                test = test.set(key, value);
              });
              if (send) test = test.send(send);
              const res = await test
                .expect("Content-Type", /json/)
                .expect(code);
              if (callback) callback(null, res);
            } catch (e) {
              if (callback) callback(e, null);
            }
          });
        }
      );
    }
  );
};
