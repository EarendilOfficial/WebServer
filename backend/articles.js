const express = require('express');
const Article = require('./models/article')
const router = express.Router()



router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render('articles/edit', { article: article })
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
router.post('/', async (req, res, next) => { //new
    req.article =  new Article()
    next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => { //edit
    req.article =  await Article.findById(req.params.id)
    next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/admin-blogs');
});

function saveArticleAndRedirect(path){
    return async (req, res) => {
    console.log("--- INTENTANDO GUARDAR ARTÍCULO ---");
    console.log("Datos recibidos:", req.body); 

    let article = req.article
        article.title = req.body.title
        article.description= req.body.description
        article.markdown= req.body.markdown
    
    try {
        article = await article.save()
        console.log("¡Guardado con éxito! ID:", article.id);
        res.redirect(`/articles/${article.slug}`)
    } catch (e) {
        console.log("--- ERROR AL GUARDAR ---"); 
        console.log(e.message); 
        res.render(`articles/${path}`, {article: article})
    }
    }
}

module.exports = router;

