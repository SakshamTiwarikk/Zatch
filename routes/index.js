const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

// Home Page
router.get("/", (req, res) => {
  const error = req.flash("error");
  res.render("index", { error, loggedin: false });
});

// Shop Page
router.get("/shop", isLoggedIn, async (req, res) => {
  try {
    const products = await productModel.find();
    const success = req.flash("success");
    const error = req.flash("error");

    res.render("shop", {
      products,
      loggedin: true,
      success,
      error,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    req.flash("error", "Could not load products.");
    res.render("shop", {
      products: [],
      loggedin: true,
      success: [],
      error: req.flash("error"),
    });
  }
});

// Account Pages (GET routes)
router.get("/account", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    res.render("account", {
      user: user,
      currentPage: "profile",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading account:", error);
    req.flash("error", "Could not load account information.");
    res.redirect("/shop");
  }
});

router.get("/account/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    res.render("account", {
      user: user,
      currentPage: "profile",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    req.flash("error", "Could not load profile information.");
    res.redirect("/shop");
  }
});

router.get("/account/security", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    res.render("account", {
      user: user,
      currentPage: "security",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading security:", error);
    req.flash("error", "Could not load security settings.");
    res.redirect("/shop");
  }
});

router.get("/account/preferences", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    res.render("account", {
      user: user,
      currentPage: "preferences",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading preferences:", error);
    req.flash("error", "Could not load preferences.");
    res.redirect("/shop");
  }
});

router.get("/account/billing", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    res.render("account", {
      user: user,
      currentPage: "billing",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Error loading billing:", error);
    req.flash("error", "Could not load billing information.");
    res.redirect("/shop");
  }
});

// Profile Update (POST)
router.post("/account/profile", isLoggedIn, async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debug log

    // Check if req.body exists and has data
    if (!req.body || Object.keys(req.body).length === 0) {
      req.flash("error", "No form data received. Please try again.");
      return res.redirect("/account/profile");
    }

    const { fullname, email, phone, bio } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/account/profile");
    }

    // Update fields only if they are provided
    if (fullname !== undefined) user.fullname = fullname;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    req.flash("success", "Profile updated successfully!");
    res.redirect("/account/profile");
  } catch (error) {
    console.error("Profile update error:", error);
    req.flash("error", "An error occurred while updating your profile.");
    res.redirect("/account/profile");
  }
});

// Change Password (POST)
router.post("/account/change-password", isLoggedIn, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/account/security");
    }

    // Add password validation logic here
    if (newPassword !== confirmPassword) {
      req.flash("error", "New passwords do not match.");
      return res.redirect("/account/security");
    }

    if (newPassword.length < 6) {
      req.flash("error", "Password must be at least 6 characters long.");
      return res.redirect("/account/security");
    }

    // You should verify current password here using bcrypt
    // For now, just updating the password
    user.password = newPassword; // Hash this in production
    await user.save();

    req.flash("success", "Password updated successfully!");
    res.redirect("/account/security");
  } catch (error) {
    console.error("Password change error:", error);
    req.flash("error", "An error occurred while changing your password.");
    res.redirect("/account/security");
  }
});

// Preferences Update (POST)
router.post("/account/preferences", isLoggedIn, async (req, res) => {
  try {
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      profilePublic,
      showOnlineStatus,
    } = req.body;

    const user = await userModel.findById(req.user._id);

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/account/preferences");
    }

    // Initialize preferences object if it doesn't exist
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update preferences (checkboxes send 'on' when checked, undefined when not)
    user.preferences.emailNotifications = emailNotifications === "on";
    user.preferences.smsNotifications = smsNotifications === "on";
    user.preferences.pushNotifications = pushNotifications === "on";
    user.preferences.profilePublic = profilePublic === "on";
    user.preferences.showOnlineStatus = showOnlineStatus === "on";

    await user.save();

    req.flash("success", "Preferences updated successfully!");
    res.redirect("/account/preferences");
  } catch (error) {
    console.error("Preferences update error:", error);
    req.flash("error", "An error occurred while updating your preferences.");
    res.redirect("/account/preferences");
  }
});

// View Cart
router.get("/cart", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");

    const cartItem = user.cart[0]; // Optional: handle multiple products
    const finalBill = cartItem
      ? Number(cartItem.price + 20) - Number(cartItem.discount)
      : 0;

    res.render("cart", { user, finalBill });
  } catch (err) {
    console.error("Error loading cart:", err);
    req.flash("error", "Could not load cart.");
    res.redirect("/shop");
  }
});

// Add to Cart
router.get("/addtocart/:productid", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/shop");
    }

    const product = await productModel.findById(req.params.productid);
    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/shop");
    }

    user.cart.push(req.params.productid);
    await user.save();

    req.flash("success", "Product added to cart successfully!");
    res.redirect("/shop");
  } catch (error) {
    console.error("Error adding to cart:", error);
    req.flash("error", "Could not add product to cart.");
    res.redirect("/shop");
  }
});

// Logout
router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.redirect("/");
  });
});

module.exports = router;
