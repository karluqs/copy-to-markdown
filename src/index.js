class ChatGPTExtension {
    constructor() {
        this.handleRequest()

    }

    handleRequest(){
        chrome.runtime.onMessage.addListener( async (request, sender, response) => {
            if (request.action == "PROMPT1") this.promptToChatGPT(this.prompt1)
            if (request.action == "PROMPT2") this.promptToChatGPT(this.prompt2)
        })

    }

    promptToChatGPT(prompt) {
        const input = document.querySelector("textarea")
        input.value = prompt
        document.querySelector("textarea~button").click()
    }

    prompt1 = "From now on, if you need to write a mathematical expression, use katex notation and follow these rules:\n1. If it is a block equation, display it in a single P element and wrap it with double dollar signs like this:\n\n$$e=mc^{2}$$\n\n2. If it is an inline equation, use the two backlash and parenthesis notation of katex, like this: \\(e^{i \\\pi}-1=0\\).\n\nCan you give me an example of a bloack equation to see that you understand?"
    prompt2 = "Say something, but in French"


const CGPTExtension = new ChatGPTExtension()
