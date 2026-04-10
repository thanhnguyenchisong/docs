const { translate } = require('@vitalets/google-translate-api');

async function test() {
    try {
        const res = await translate('<p>Hello <b>world</b>!</p>', { to: 'vi' });
        console.log(res.text);
    } catch (e) {
        console.error(e);
    }
}
test();
