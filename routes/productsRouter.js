const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
    
    // Validate required fields
    if (!name || !price) {
      req.flash("error", "Name and price are required");
      return res.redirect("/owners/admin");
    }
    
    // Check if file was uploaded
    if (!req.file) {
      req.flash("error", "Please upload a product image");
      return res.redirect("/owners/admin");
    }

    await productModel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    });

    req.flash("success", "Product created successfully.");
    res.redirect("/owners/admin");
  } catch (error) {
    console.error("Error creating product:", error);
    req.flash("error", "Failed to create product");
    res.redirect("/owners/admin");
  }
});

module.exports = router;