const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
}


  users.push({ username, password });
  console.log("User registered successfully:", users); // Debugging log
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop 
// public_users.get('/',function (req, res) {
//   res.send(JSON.stringify(books,null,5));
// });
// Get the book list available in the shop using Promise callbacks
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
      resolve(books); // Resolving with the books data
  })
  .then((bookList) => {
      res.status(200).json(bookList);
  })
  .catch((error) => {
      res.status(500).json({ message: "Error retrieving book list", error });
  });
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//   const isbn = req.params.isbn;
//   if (books[isbn]) {
//         return res.json(books[isbn]); // Return book details if found
//     } else {
//         return res.status(404).json({ message: "Book not found" });
//     }

//  });
// Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
      if (books[isbn]) {
          resolve(books[isbn]); // Resolve with book details
      } else {
          reject({ message: "Book not found" }); // Reject if book is not found
      }
  })
  .then((bookDetails) => {
      res.status(200).json(bookDetails);
  })
  .catch((error) => {
      res.status(404).json(error);
  });
});

  
// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//   const author = req.params.author;
//   let booksByAuthor = [];

//     // Loop through books object to find matching author
//     for (let isbn in books) {
//         if (books[isbn].author === author) {
//             booksByAuthor.push(books[isbn]);
//         }
//     }

//     if (booksByAuthor.length > 0) {
//         return res.json(booksByAuthor);
//     } else {
//         return res.status(404).json({ message: "No books found by this author" });
//     }
// });

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  // Create a Promise
  new Promise((resolve, reject) => {
      let booksByAuthor = [];

      // Loop through books object to find matching author
      for (let isbn in books) {
          if (books[isbn].author === author) {
              booksByAuthor.push(books[isbn]);
          }
      }

      if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
      } else {
          reject("No books found by this author");
      }
  })
  .then((booksByAuthor) => {
      res.status(200).json(booksByAuthor);
  })
  .catch((error) => {
      res.status(404).json({ message: error });
  });
});

// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   const title = req.params.title;
//   let booksByTitle = [];

//   for(let isbn in books){
//     if(books[isbn].title === title){
//       booksByTitle.push(books[isbn]);
//     }
//   }

//   if(booksByTitle.length>0){
//     return res.json(booksByTitle);
//   }else{
//     return res.status(404).json({message: "No book found by this title!"})
//   }
// });
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  // Create a Promise
  new Promise((resolve, reject) => {
      let booksByTitle = [];

      // Loop through books object to find matching title
      for (let isbn in books) {
          if (books[isbn].title === title) {
              booksByTitle.push(books[isbn]);
          }
      }

      if (booksByTitle.length > 0) {
          resolve(booksByTitle);
      } else {
          reject("No book found by this title!");
      }
  })
  .then((booksByTitle) => {
      res.status(200).json(booksByTitle);
  })
  .catch((error) => {
      res.status(404).json({ message: error });
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
        return res.json(books[isbn].reviews); // Return book details if found
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
  
});

module.exports.general = public_users;
