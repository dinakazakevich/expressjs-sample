const express = require('express');
const router = express.Router();
const fs = require('fs');

// Read and parse users.json file
const readUserFromJson = () => {
  const users = fs.readFileSync("./data/users.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    console.log("File data:", jsonString);
  })
  return JSON.parse(users);
}

const writeUsersToJson = (users) => {
  const jsonString = JSON.stringify(users);
  fs.writeFileSync('./data/users.json', jsonString, err => {
    if (err) {
      console.log('Error writing file', err);
    } else {
      console.log('Successfully wrote file');
    }
  })
}


// Filter users.json by user id
const getUser = (id) => {
  const users = readUserFromJson();
  const user = users.find((user) => id === user.id);
  if (!user) {
    return {
      code: 404,
      errorMessage: `User with id ${id} doesn't exist.`
    };
  }
  return user
};

// Update Json with the new user
const createUser = (id, name) => {
  const existingUsers = readUserFromJson();
  const newUser = { id, name };
  existingUsers.push(newUser);
  // console.log("updatedFile", existingUsers);
  writeUsersToJson(existingUsers);
  const newUsers = readUserFromJson();
  const newWrittenUser = newUsers.find((user) => id === user.id);
  if (!newWrittenUser) {
    return {
      code: 500,
      errorMessage: "User creation failed"
    };
  }
  return newWrittenUser;
}

// Remove user from the json
const removeById = (users, id) => {
  console.log("users", users);
  const requiredIndex = users.findIndex(el => {
    return el.id === id;
  });
  console.log("requiredIndex", requiredIndex)
  if(requiredIndex === -1){
    return false;
  }
  users.splice(requiredIndex, 1)
  return users;
};

// Update json with the removed user
const deleteUser = (id) => {
  const users = readUserFromJson();
  const updatedJson = removeById(users, id)
  console.log('updatedJson', updatedJson);
  if (!updatedJson) {
    return {
      code: 404,
      errorMessage: `User with id ${id} doesn't exist.`
    };
  }
  writeUsersToJson(updatedJson);
  return {
    code: 200, result: `User with id ${id} has been removed.`
  };
}

// GET users listing
router.get('/', function(req, res, next) {
  res.send({ users: readUserFromJson() });
});

// GET user by id
router.get('/:id', function(req, res, next) {
  res.send({user: getUser(+req.params.id)});
});

/* POST to create a user with name and id */
router.post('/', function (req, res) {
  res.json({status: 'New user created', user: { user: createUser(req.body.id, req.body.name) }});

});

/* DELETE user by ID request */
router.delete('/:id', function (req, res) {
  res.json(deleteUser(+req.params.id));
});

module.exports = router;
