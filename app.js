const express = require('express');
const http = require('http');
const session = require('session-express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bcrypt = require('bcrypt');

// declare app
app = express();

mongoose.connect("mongoose://localhost/")
