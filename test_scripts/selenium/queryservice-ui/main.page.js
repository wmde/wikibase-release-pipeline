'use strict';

// login.page.js
const Page = require('./page')

class MainPage extends Page {

	get queryEditor() { return $('.queryEditor') }
	get submitBtn() { return $('#execute-button') }
	get resultTable() { return $("#query-result table.table.table-hover") }
	get resultTableRows() { return $("#query-result table.table.table-hover tr") }

    open( query ) {
        super.open('/' +encodeURI(query))
    }

    submit() {
        this.submitBtn.click()
    }

}

module.exports = new MainPage();