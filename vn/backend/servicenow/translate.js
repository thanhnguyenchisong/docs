process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const cheerio = require('cheerio');
const { translate } = require('bing-translate-api');

async function main() {
    console.log("Reading HTML file...");
    const html = fs.readFileSync('Creating Custom Widgets.html', 'utf-8');
    const $ = cheerio.load(html, { decodeEntities: false });

    // Ensure we start with a clean DOM if previous partial translations were made it won't matter since we read from original file.
    const elementsToSet = new Set();
    const blockTags = 'p, h1, h2, h3, h4, h5, h6, ul, ol, li, div, table, pre, blockquote';

    $('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, title, span.field, span.value, .lp-content-type, div.lp-module-title, span.module-title, span.title, div.print-title').each((i, el) => {
        if ($(el).closest('pre, code, script, style').length > 0) return;
        
        if ($(el).is('div.print-title')) return;
        
        if ($(el).find(blockTags).length > 0) return;
        
        const text = $(el).text().trim();
        if (text.length > 1 && /[a-zA-Z]/.test(text)) {
            elementsToSet.add(el);
        }
    });

    const elementsToTranslate = Array.from(elementsToSet);
    console.log(`Found ${elementsToTranslate.length} elements to translate.`);

    for (let i = 0; i < elementsToTranslate.length; i++) {
        const el = elementsToTranslate[i];
        let innerHTML = $(el).html();
        if (!innerHTML || innerHTML.trim() === '') continue;

        try {
            // bing-translate-api has (text, from, to)
            const res = await translate(innerHTML, null, 'vi');
            $(el).html(res.translation);
            if ((i + 1) % 50 === 0) {
                console.log(`Translated ${i + 1}/${elementsToTranslate.length}`);
            }
            await new Promise(r => setTimeout(r, 100)); // be nice to bing
        } catch (err) {
            console.error(`Error translating part ${i}: ${err.message}`);
            // retry once
            try {
                await new Promise(r => setTimeout(r, 2000));
                const res = await translate(innerHTML, null, 'vi');
                $(el).html(res.translation);
            } catch (e2) {}
        }
    }

    fs.writeFileSync('Custom Widgets_vn.html', $.html());
    console.log('Done! Translated file created: Custom Widgets_vn.html');
}

main().catch(console.error);
