import { createConnection, Schema } from 'mongoose'
import { marked } from 'marked' // Asegúrate de destructurar así
import slugify from 'slugify'
import createDomPurify from 'dompurify'
import { JSDOM } from 'jsdom'
const dompurify = createDomPurify(new JSDOM().window)

// Conexión específica
const blogDB = createConnection('mongodb://localhost:27017/HtmlContent');

const articleSchema = new Schema({
    title: {
        type: String, 
        required: true
    },
    description:{
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    // Este campo guardará el HTML limpio
    sanitizeHtml: {
        type: String,
        //required: true
    }
})
articleSchema.pre('validate', function(next){
    // CAMBIO 2: Agregamos 'chismosos' (console.log) para ver si entra aquí
    console.log("--- PROCESANDO MARKDOWN ---");
    
    if (this.title){
        this.slug = slugify(this.title, {lower:true, strict: true})
    }
    
    if (this.markdown){
        console.log("Markdown detectado, intentando convertir...");
        try {
            // INTENTO A: Versión moderna de marked (La más probable)
            this.sanitizeHtml = dompurify.sanitize(marked.parse(this.markdown));
            console.log("¡Conversión EXITOSA con marked.parse!");
        } catch (error) {
            console.log("Error con marked.parse, intentando modo antiguo...", error.message);
            try {
                // INTENTO B: Versión antigua (por si acaso)
                this.sanitizeHtml = dompurify.sanitize(marked(this.markdown));
                console.log("¡Conversión EXITOSA con marked()!");
            } catch (err2) {
                console.error("--- ERROR FATAL CON MARKED ---", err2);
            }
        }
    }
    next();
})

export default blogDB.model('Article', articleSchema);