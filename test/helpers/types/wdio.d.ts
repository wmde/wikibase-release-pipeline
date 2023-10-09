declare namespace WebdriverIO {
	interface Browser {
		editPage: ( host: string, title: string, content: string, captcha?: string    ) => Promise<void>
	}

	// interface Element {
	//     elementCustomCommand: (arg: any) => Promise<number>
	// }
}