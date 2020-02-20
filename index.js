const bodyParser = require(`body-parser`);
const express = require("express");
const cors = require("cors");
const sha256 = require(`sha256`);
const jwt = require(`jsonwebtoken`);
const {
  CNN,
  ActivationFunction,
  Layer,
  NetworkArchitectures
} = require(`../CNN-js/cnn`);

const checkAuth = require(`authCheck`);
var app = express();

//app.use(bodyParser.urlencoded({ extended:false }))
app.use(bodyParser.json());
app.use(cors());

var neural_networks = {};

app.post("/createCnn", checkAuth, (req, res) => {
  const neuralNet = new CNN(NetworkArchitectures.LeNet5);
  const net_id = new Date().getTime();

  if (neural_networks[req.userId])
    neural_networks[req.userId][net_id] = neuralNet;
  else neural_networks[req.userId] = { [net_id]: neuralNet };
  res.send({ network_id: net_id });
});

app.get(`/getNetwork/:netId`, checkAuth, (req, res) => {
  if (neural_networks[req.userId])
    res.send(neural_networks[req.userId][req.params.netId]);
  else res.send([]);
});

app.get(`/setParameter/:netId`, checkAuth, (req, res) => {
  try {
    if (req.params.netId) {
      if (!neural_networks[req.userId][req.params.netId])
        throw new Error(`neural network doesnt exist`);

      neural_networks[req.userId][req.params.netId][req.query.param] =
        req.query.value;
      res.send({});
    } else throw new Error("no network id specified");
  } catch (e) {
    res.send({ error: e });
  }
});

app.get(`/getNetworks`, checkAuth, (req, res) => {
  if (neural_networks[req.userId])
    res.send(Object.keys(neural_networks[req.userId]));
  else res.send([]);
});

app.post(`/login`, (req, res) => {
  if (req.body.user && req.body.pass) {
    let hashPass = sha256(req.body.pass);
    let authUser = users.find(
      u => u.user === req.body.user && u.pass === hashPass
    );
    console.log(authUser);
    if (authUser)
      res.send({
        token: jwt.sign({ userId: authUser.userId }, JWTsecret, {
          expiresIn: `1 week`
        })
      });
    else res.send({ err: `invalid username or password` });
  } else {
    console.log(req.body);
    res.send({ err: `username and password required` });
  }
});

app.listen(3005, () => console.log("Server ready on 3005"));
