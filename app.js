const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session");
const connectDB = require("./config/db");

//Load Config
dotenv.config({ path: "./config/config.env" });

//Passport Config
require("./config/passport")(passport);

//Connect to MongoDB
connectDB();

//made app instance of express
const app = express();

//Using morgan
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

//Handlebars
//!Add the word .engine after exphbs
app.engine(".hbs", exphbs.engine({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

// Sessions
app.use(
	session({
		secret: "keyword cat",
		resave: false,
		saveUninitialized: false,
	})
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Static Folder
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));

//Port
let PORT = process.env.PORT || 3000;

//App Listening on PORT
app.listen(PORT, () => {
	console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`);
});