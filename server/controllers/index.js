// pull in our models. This will automatically load the index.js from that folder
const models= require('../models');
//const dogModel = require('../models/Dog.js');

// get the Cat model
const { Cat, Dog } = models;
//const { Dog } = dogModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};
const defaultDogData = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
}

// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);
let lastAddedDog = new Dog(defaultDogData);

// Function to handle rendering the index page.
const hostIndex = (req, res) => {

  res.render('index', {
    currentName: lastAdded.name,
    currentDogName: lastAddedDog.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// Function for rendering the page1 template
// Page1 has a loop that iterates over an array of cats
const hostPage1 = async (req, res) => {

  try {

    const docs = await Cat.find({}).lean().exec();

    // Once we get back the docs array, we can send it to page1.
    return res.render('page1', { cats: docs });
  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};
// Function to render the untemplated page2.
const hostPage2 = (req, res) => {
  res.render('page2');
};
const hostPage3 = (req, res) => {
  res.render('page3');
};

// Function to render the untemplated page3.
const hostPage4 = async (req, res) => {

  try{
    const dogDocs = await Dog.find({}).lean().exec();

    return res.render('page4', {dogs: dogDocs});
  }catch(err){
    console.log(err);
    return res.status(500).json({error: 'failed to find dogs'});
  }
};

// Get name will return the name of the last added cat.
const getName = (req, res) => res.json({ name: lastAdded.name });
const getDogName = (req, res) => res.json({name: lastAddedDog.name});

// Function to create a new cat in the database
const setName = async (req, res) => {

  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }

  /* If they did send all the data, we want to create a cat and add it to our database.
     We begin by creating a cat that matches the format of our Cat schema. In this case,
     we define a name and bedsOwned. We don't need to define the createdDate, because the
     default Date.now function will populate that value for us later.
  */
  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };

  /* Once we have our cat object set up. We want to turn it into something the database
     can understand. To do this, we create a new instance of a Cat using the Cat model
     exported from the Models folder.

     Note that this does NOT store the cat in the database. That is the next step.
  */
  const newCat = new Cat(catData);

  try {

    await newCat.save();

    lastAdded = newCat;
    return res.json({
      name: lastAdded.name,
      beds: lastAdded.bedsOwned,
    });
  } catch (err) {
    // If something goes wrong while communicating with the database, log the error and send
    // an error message back to the client.
    console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }
};
const setDogName = async (req, res) => {

  if (!req.body.firstname || !req.body.lastname || !req.body.breed || !req.body.age) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'firstname, lastname, breed and age are all required' });
  }

  const dogData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    breed: `${req.body.breed}`,
    age: req.body.age,
  };

  const newDog = new Dog(dogData);

  try {

    await newDog.save();

    lastAddedDog = newDog;
    return res.json({
      name: lastAddedDog.name,
      breed: lastAddedDog.breed,
      age: lastAddedDog.age,
    });
  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: 'failed to create dog' });
  }
};

// Function to handle searching a cat by name.
const searchName = async (req, res) => {
  /* When the user makes a POST request, bodyParser populates req.body with the parameters
     as we saw in setName() above. In the case of searchName, the user is making a GET request.
     GET requests do not have a body, but they can have query parameters. bodyParser will also
     handle these, and store them in req.query instead.

     If the user does not give us a name to search by, throw an error.
  */
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  /* If they do give us a name to search, we will as the database for a cat with that name.
     Remember that since we are interacting with the database, we want to wrap our code in a
     try/catch in case the database throws an error or doesn't respond.
  */
  try {
    /* Just like Cat.find() in hostPage1() above, Mongoose models also have a .findOne()
       that will find a single document in the database that matches the search parameters.
       This function is faster, as it will stop searching after it finds one document that
       matches the parameters. The downside is you cannot get multiple responses with it.

       One of three things will occur when trying to findOne in the database.
        1) An error will be thrown, which will stop execution of the try block and move to the catch block.
        2) Everything works, but the name was not found in the database returning an empty doc object.
        3) Everything works, and an object matching the search is found.
    */
    const doc = await Cat.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    // Otherwise, we got a result and will send it back to the user.
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
const searchDogName = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  try {

    const doc = await Dog.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }

    // Otherwise, we got a result and will send it back to the user.
    return res.json({ name: doc.name, breed: doc.breed, age: doc.age });
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

/* A function for updating the last cat added to the database.
   Usually database updates would be a more involved process, involving finding
   the right element in the database based on query, modifying it, and updating
   it. For this example we will just update the last one we added for simplicity.
*/
const updateLast = (req, res) => {
  // First we will update the number of bedsOwned.
  lastAdded.bedsOwned++;

  /* Remember that lastAdded is a Mongoose document (made on line 14 if no new
     ones were made after the server started, or line 116 if there was). Mongo
     documents have an _id, which is a globally unique identifier that distinguishes
     them from other documents. Our mongoose document also has this _id. When we
     call .save() on a document, Mongoose and Mongo will use the _id to determine if
     we are creating a new database entry (if the _id doesn't already exist), or
     if we are updating an existing entry (if the _id is already in the database).

     Since lastAdded is likely already in the database, .save() will update it rather
     than make a new cat.

     We can use async/await for this, or just use standard promise .then().catch() syntax.
  */
  const savePromise = lastAdded.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};
const updateLastDog = (req, res) => {
  // First we will update the number of bedsOwned.
  lastAddedDog.age++;

  const savePromise = lastAddedDog.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastAddedDog.name,
    breed: lastAddedDog.breed,
    age: lastAddedDog.age,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.
// const notFound = (req, res) => {
//   res.status(404).render('notFound', {
//     page: req.url,
//   });
// };

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  getName,
  getDogName,
  setName,
  setDogName,
  updateLast,
  updateLastDog,
  searchName,
  searchDogName,
  notFound,
};
