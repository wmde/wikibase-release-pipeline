class Page {
    constructor() {
    }

    open(path) {
        browser.url('http://' + process.env.QUERYSERVICE_UI_SERVER + path)
    }
}
module.exports = Page;