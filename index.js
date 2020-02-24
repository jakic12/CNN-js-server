const bodyParser = require(`body-parser`);
const express = require("express");
const cors = require("cors");
const {
  CNN,
  ActivationFunction,
  Layer,
  NetworkArchitectures
} = require(`../CNN-js/cnn`);

const { checkAuth, userExists } = require(`./auth/authCheck`);
var app = express();

//app.use(bodyParser.urlencoded({ extended:false }))
app.use(bodyParser.json());
app.use(cors());

var neural_networks = {};

app.post("/createCnn", checkAuth, (req, res) => {
  const neuralNet = new CNN(NetworkArchitectures.LeNet5);
  const net_id = new Date().getTime();
  console.log(req.query);
  neuralNet.name = req.query.name || net_id;
  neuralNet.id = net_id;

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
  const props = (req.query.props && JSON.parse(req.query.props)) || [
    "name",
    "id",
    "shape"
  ]; // wich properties of each network should it return

  if (neural_networks[req.userId]) {
    const outObject = {};

    Object.keys(neural_networks[req.userId]).forEach(id => {
      const out = {};
      props.forEach(prop => {
        out[prop] = neural_networks[req.userId][id][prop];
      });
      outObject[id] = out;
    });
    res.send(outObject);
  } else res.send([]);
});

app.post(`/login`, (req, res) => {
  if (req.body.user && req.body.pass) {
    res.send(userExists(req.body.user, req.body.pass));
  } else {
    console.log(req.body);
    res.send({ err: `username and password required` });
  }
});

app.listen(3005, () => console.log("Server ready on 3005"));
