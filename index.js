const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./database/dbHelpers.js');

const server = express();
const PORT = process.env.PORT || 3310;

server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send('Its Alive!');
});

server.post('/api/register', (req, res) => {
  const user = req.body;
  user.password = bcrypt.hashSync(user.password, 16);
  db.insert(user)
  .then(ids => {
    res.status(201).json({id: ids[0]});
  })
  .catch(err => {
    res.status(500).send(err);
  });
});

server.post('/api/login', (req, res) => {
  // check that username exists AND that passwords match
  const bodyUser = req.body;
  db.findByUsername(bodyUser.username)
  .then(users => {
      // username valid   hash from client == hash from db
    if (users.length && bcrypt.compareSync(bodyUser.password, users[0].password)) {
      res.json({ info: "correct"});
    } else {
      res.status(404).json({err: "invalid username or password"});
    }
  })
  .catch(err => {
    res.status(500).send(err);
  });
});

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  db('users')
    .select('id', 'username')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.listen(3310, () => console.log('\nrunning on port 3310\n'));
