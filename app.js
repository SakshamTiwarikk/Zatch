const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const db = require("./config/mongoose-connection");
const indexRouter = require("./routes/index");
const expressSession = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");

require("dotenv").config();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Use morgan logger only in development mode
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET || "devFallbackSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(flash());

// Make flash messages available to all templates as arrays (for multiple messages)
app.use((req, res, next) => {
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

// Catch-all error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash("error", "Something went wrong.");
  res.status(500).redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
