var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');

//APP CONFIG

mongoose.connect("mongodb://localhost:27017/restful_blog_app", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//MONGOOSE/MODEL/CONFIG

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});

var Blog = mongoose.model("Blog", blogSchema);

//RESTful ROUTES
//INDES ROUTES
app.get("/", (req, res) => {
    res.redirect("/blogs");
})

app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index", { blogs: blogs });
        }
    })
})

//NEW ROUTE
app.get("/blogs/new", (req, res) => {
    res.render("new");
})

//CREATE ROUTE
app.post("/blogs", (req, res) => {
    //sanitizing the body
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    Blog.create(req.body.blog, (err, blog) => {
        if (err) {
            res.render("new")
        } else {
            //redirect to the index
            res.redirect("/blogs");
        }
    })
})

//SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect("/blogs")
        } else {
            res.render("show", { blog: foundBlog });
        }
    })
})

//EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundedBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", { blog: foundedBlog });
        }
    })
})

//UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
    //sanitizing the body
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
})

//DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
    //destroy blog
    Blog.findByIdAndDelete(req.params.id, (err) => {
        //redirect somewhere
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
})

app.listen(3001, () => {
    console.log("BlogApp running at port 3001");
});