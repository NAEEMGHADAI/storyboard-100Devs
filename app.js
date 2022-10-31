const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
// const mongoStore = require("connect-mongo");(session) this will give error

const connectDB = require("./config/db");

//Load Config
dotenv.config({ path: "./config/config.env" });

//Passport Config
require("./config/passport")(passport);

//Connect to MongoDB
connectDB();

//made app instance of express
const app = express();

//Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Method Overriding
app.use(
	methodOverride(function (req, res) {
		if (req.body && typeof req.body === "object" && "_method" in req.body) {
			//lookd in urlencoded POST bodies and delete it
			let method = req.body._method;
			delete req.body._method;
			return method;
		}
	})
);

//Using morgan
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

//Handlebars Helpers
const {
	formatDate,
	stripTags,
	truncate,
	editIcon,
	select,
} = require("./helpers/hbs");
const { type } = require("os");

//Handlebars
//!Add the word .engine after exphbs
app.engine(
	".hbs",
	exphbs.engine({
		helpers: {
			formatDate,
			stripTags,
			truncate,
			editIcon,
			select,
		},
		defaultLayout: "main",
		extname: ".hbs",
	})
);
app.set("view engine", ".hbs");

// Sessions
app.use(
	session({
		secret: "keyword cat",
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.MONGO_URI,
		}),
	})
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//set global variable
app.use(function (req, res, next) {
	res.locals.user = req.user || null;
	next();
});

//Static Folder
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

//Port
let PORT = process.env.PORT || 3000;

//App Listening on PORT
app.listen(PORT, () => {
	console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`);
});
