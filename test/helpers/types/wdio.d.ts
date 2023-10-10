declare namespace WebdriverIO {
	interface Browser {
		editPage: ( host: string, title: string, content: string, captcha?: string ) => Promise<string>
	}

	// interface Element {
	//     elementCustomCommand: (arg: any) => Promise<number>
	// }
}