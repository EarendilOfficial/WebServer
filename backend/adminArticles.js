const express = require("express");
const router = express.Router();
const Article = require("./models/article");

// LISTA ADMIN
router.get("/", async (req, res) => {
    const articles = await Article.find().sort({ createdAt: "desc" });
    res.render("articles/admin-blogs", { articles });
});

// FORM NUEVO
router.get("/new", (req, res) => {
    res.render("articles/new", { article: new Article() });
});

// GUARDAR NUEVO
router.post("/", async (req, res, next) => {
    req.article = new Article();
    next();
}, saveArticleAndRedirect("new"));

// FORM EDITAR
router.get("/edit/:id", async (req, res) => {
    const article = await Article.findById(req.params.id);
    res.render("articles/edit", { article });
});

// GUARDAR EDICIÓN
router.put("/:id", async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect("edit"));

// BORRAR
router.delete("/:id", async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect("/admin-blogs");
});

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;

        try {
            await article.save();
            res.redirect(`/articles/${article.slug}`);
        } catch (e) {
            console.log(e.message);
            res.render(`articles/${path}`, { article });
        }
    };
}

module.exports = router;
