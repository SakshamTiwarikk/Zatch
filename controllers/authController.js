const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    const { email, password, fullname } = req.body;

    if (!email || !password || !fullname) {
      req.flash("error", "All fields are required.");
      return res.redirect("/register"); // or your registration page route
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      req.flash("error", "User already exists, please login.");
      return res.redirect("/login");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      email,
      password: hashedPassword,
      fullname,
    });

    const token = generateToken(newUser);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    req.flash("success", "Account created successfully. Please login.");
    res.redirect("/"); // redirect to login page with flash message
  } catch (error) {
    console.error("Register error:", error);
    req.flash("error", "Server error. Please try again later.");
    res.redirect("/register");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or password invalid." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Email or password invalid." });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect("/shop");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.logout = async function (req, res) {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      maxAge: 0,
    });
    res.redirect("/");
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
