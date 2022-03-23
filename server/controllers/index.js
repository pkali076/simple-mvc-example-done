// pull in our models. This will automatically load the index.js from that folder
const models= require('../models');
//const dogModel = require('../models/Dog.js');

// get the Cat model
const { Cat, Dog } = models;
//const { Dog } = dogModel;


const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};
const defaultDogData = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
}


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


  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(catData);

  try {

    await newCat.save();

    lastAdded = newCat;
    return res.json({
      name: lastAdded.name,
      beds: lastAdded.bedsOwned,
    });
  } catch (err) {

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

  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  try {

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

const updateLast = (req, res) => {
  // First we will update the number of bedsOwned.
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  }));


  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.

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


  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

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
