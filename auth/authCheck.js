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

module.exports = checkAuth;
