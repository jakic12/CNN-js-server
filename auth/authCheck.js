const sha256 = require(`sha256`);
const jwt = require(`jsonwebtoken`);

class User {
  constructor(username, password) {
    this.user = username;
    this.pass = sha256(password);
    this.userId = sha256(`${this.user}${password}${new Date()}`);
  }
}
var users = [new User(`jakob`, `test`)];

var JWTsecret = `dosijpoiJUS{)D9uf09iu32-03-0}_)@($#}-03i9jg]f0-9i3)`;

const checkAuth = (req, res, next) => {
  let userId;
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    userId = jwt.verify(token, JWTsecret).userId;
  } catch (error) {
    res.status(401).send('{"err":"Unauthorized"}');
    return;
  }

  req.userId = userId;
  next();
};

const userExists = (user, pass) => {
  let hashPass = sha256(pass);
  let authUser = users.find(u => u.user === user && u.pass === hashPass);
  if (authUser)
    return {
      token: jwt.sign({ userId: authUser.userId }, JWTsecret, {
        expiresIn: `1 week`
      })
    };
  else return { err: `invalid username or password` };
};

module.exports = { checkAuth, userExists };
