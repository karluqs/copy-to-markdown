const btnPrompt1 = document.querySelector("#btn-prompt")
const btnPrompt2 = document.querySelector("#btn-render")
const [currentTab] = await chrome.tabs.query({active: true, currentWindow: true})

btnPrompt1.addEventListener("click", async () => {
    await chrome.tabs.sendMessage(currentTab.id, { action: "PROMPT1" })
})

btnPrompt2.addEventListener("click", async () => {
    await chrome.tabs.sendMessage(currentTab.id, { action: "PROMPT2" })
})