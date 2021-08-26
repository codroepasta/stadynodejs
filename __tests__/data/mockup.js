const mockup = (paranoid = true, options = null) => {
  let data = {
    t_m_authority: require("./Authorities.json"),
    t_m_user: require("./Users.json"),
    t_m_user_authority: require("./UserAuthorities.json"),
  };

  if (paranoid) {
    Object.entries(data).forEach(
      ([tableName, records]) =>
        (data[tableName] = records.filter(
          (records) => records.deleted_date === null
        ))
    );
  }
  if (options) {
    Object.entries(options).forEach(([tableName, conditions]) => {
      data[tableName] = data[tableName].filter((record) =>
        Object.entries(conditions).every(
          ([key, value]) => record[key] === value
        )
      );
    });
  }
  data.t_m_user = data.t_m_user.map((user) => {
    const t_m_user_authority = data.t_m_user_authority.filter(
      (userAuthority) => user.id === userAuthority.user_id
    );
    user.UserAuthorities = t_m_user_authority;
    return user;
  });
  delete data.t_m_user_authority;
  return data;
};

module.exports = mockup;
