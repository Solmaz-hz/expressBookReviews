const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
   // Check if username is between 3 and 20 characters
   if (username.length < 3 || username.length > 20) {
    return false;
}

// Ensure username only contains letters and numbers
const regex = /^[a-zA-Z0-9]+$/;
return regex.test(username);
}

const authenticatedUser = (username,password)=>{
  console.log("Checking user:", username, password); // Debugging log
  
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  console.log("Stored users:", users); // Check if users are properly stored

  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT Token
  const token = jwt.sign({ username: username }, "fingerprint_customer", { expiresIn: "1h" });

  // Store JWT token in session
  req.session.accessToken = token;

  return res.status(200).json({
      message: "Login successful",
      token: token
  });

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  const review = req.query.review;

   // Ensure user is authenticated
   if (!req.session.accessToken) {
    return res.status(401).json({ message: "User not logged in" });
}

// Decode the JWT to get the username
jwt.verify(req.session.accessToken, "fingerprint_customer", (err, decoded) => {
    if (err) {
        return res.status(403).json({ message: "Invalid token" });
    }

    const username = decoded.username; // Extract username from JWT

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Ensure reviews object exists
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update the review
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });

});

});


regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;

  //Ensure that user is authenticated
  if(!req.user || !req.user.username){
    res.status(400).json({message:"User authentication failed"});
  }

  const username = req.user.username; // Extract username from JWT token

  //check if the book exists
  if(!books[isbn]){
    res.status(401).json({message:"Book not found"});
  }

  // check if the book has reviews
  if(!books[isbn].reviews || !books[isbn].reviews[username]){
    res.status(403).json({message:"No review found for this user on this book"});
  }

  //delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });


});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
