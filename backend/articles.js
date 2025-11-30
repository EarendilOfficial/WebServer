const express = require('express');
const Article = require('./models/article')
const router = express.Router()



router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render('articles/new', { article: new Article() })
})

router.get('/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({slug:
            req.params.slug });
        if (article == null) {
            return res.redirect('/articles/new');
        }
        res.render('articles/show', { article: article });
    } catch (e) {
        console.error(e);
        res.redirect('/articles/new');
    }
});
router.post('/', async (req, res) => {
    console.log("--- INTENTANDO GUARDAR ARTÍCULO ---");
    console.log("Datos recibidos:", req.body); 

    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown
    })
    try {
        article = await article.save()
        console.log("¡Guardado con éxito! ID:", article.id);
        res.redirect(`/articles/${article.slug}`)
    } catch (e) {
        console.log("--- ERROR AL GUARDAR ---"); 
        console.log(e.message); 
        res.render('articles/new', {article: article})
    }
})


router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/admin-blogs');
});

module.exports = router;

