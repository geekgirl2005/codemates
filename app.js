var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    // requires the model with Passport-Local Mongoose plugged in
    Member      = require("./models/member"),
    User        = require("./models/user"),
    Comment     = require("./models/comment");

mongoose.connect("mongodb://localhost/codemates");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "This is awesome!",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(Member.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(Member.serializeUser());
passport.deserializeUser(Member.deserializeUser());


app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


app.get("/", function(req, res) {
    res.render("home");
})
//INDEX
app.get("/profiles", function(req, res) {

    User.find({}, function(err, allProfiles) {
        if(err) {
            console.log("COULD NOT FIND ALL PROFILES " + err);
        } else {
            res.render("profiles/index", {users: allProfiles});
        }
    });
});


//CREATE - add a new user to DB
app.post("/profiles", checkAuthentication, function(req, res) {
    User.create(req.body.comment, function(err, newProfile) {
        if(err) {
            console.log("COULD NOT CREATE A NEW DB PROFILE " + err);
        } else {
            res.redirect("/profiles");
        }
    });
});

//NEW - show a form to create a new profile
app.get("/profiles/new", checkAuthentication, function(req, res) {
    res.render("profiles/new");
})

// SHOW - shows more info about one profile
app.get("/profiles/:id", function(req, res){
    //find the user with provided ID
    User.findById(req.params.id).populate("comments").exec(function(err, user){
        if(err){
            console.log(err);
        } else {
            console.log(user)
            res.render("profiles/show", {user: user});
        }
    });
});

//================================
// COMMENTS
//================================

//NEW  - create a new comment
app.get("/profiles/:id/comments/new", checkAuthentication, function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err) {
            console.log("CAN NOT FIND A USER'S ID " + err);
        } else {
            
                    res.render("comments/new", {user: user});
                }
    });
});

//POST
app.post("/profiles/:id/comments", function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err) {
            console.log(err);
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    console.log("CAN'T RETRIEVE THE COMMENT " + err);
                } else {
                    user.comments.push(comment);
                    user.save();
                    res.redirect("/profiles/"+ user._id);
                }
            });
        }
    });
});

//  ===========
// AUTH ROUTES
//  ===========

// show register form
app.get("/register", function(req, res){
   res.render("register"); 
});
//handle sign up logic
app.post("/register", function(req, res){
    var newMember = new Member({username: req.body.username});
    Member.register(newMember, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/profiles"); 
        });
    });
});

// show login form
app.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/profiles",
        failureRedirect: "/login"
    }), function(req, res){
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/profiles");
});

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //if user is looged in, req.isAuthenticated() will return true 
        next();
    } else{
        res.redirect("/login");
    }
}



app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The server has started!");
});