const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    AllBookings: [Array],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
