const express = require('express');
const router = express.Router();
const Article = require('./models/article');

router.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' });
    
    res.render('articles/blog_index', { articles: articles });
});

router.get('/view/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug });
    
    if (article == null) return res.redirect('/articles');
    
    res.render('articles/blog_show', { article: article });
});

module.exports = router;