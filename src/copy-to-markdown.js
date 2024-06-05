import { NodeHtmlMarkdown } from 'node-html-markdown';
const browser = chrome;

// Add context menus for specific actions
const contexts = ['image', 'link', 'selection'];
for (const context of contexts) {
  browser.contextMenus.create({
    id: `cpy-as-md:${context}`,
    title: `Copy ${context} as Markdown`,
    contexts: [context]
  });
}

// Listener for events from context menus
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.linkText;
  const assetUrl = encodeURI(info.srcUrl);
  const linkUrl = encodeURI(info.linkUrl);

  let htmlContent = '';

  if (info.menuItemId.endsWith('image')) {
    htmlContent = `<img alt="${text || assetUrl}" src="${assetUrl}" />`;
  } else if (info.menuItemId.endsWith('link')) {
    htmlContent = `<a href="${linkUrl}">${text || linkUrl}</a>`;
  } else if (info.menuItemId.endsWith('selection')) {
    const completionData = await browser.scripting.executeScript({
      target : {tabId : tab.id, allFrames : true},
      func: () => { 
        const selection = document.getSelection();
        let containerTagName = '';

        if (selection.rangeCount === 0) {
          return '';
        }
      
        const selectionRange = selection.getRangeAt(0); // Only consider the first range
        const container = selectionRange.commonAncestorContainer;
      
        // All of text in container element is selected, then use parents tag
        if (selectionRange.toString().trim() === container.textContent.trim()) {
          // Handle plain text selections where parent is sometimes 'Node' or 'DocumentFragment'
          // Ideally, this should not happen, but text selection in browsers is unpredictable
          if (container instanceof Element) {
            containerTagName = container.tagName.toLowerCase();
          } else {
            containerTagName = 'p';
          }
        }
      
        const fragment = selectionRange.cloneContents();
        const wrapper = document.createElement('div');
        wrapper.append(fragment);
      
        // Converts relative links to absolute links (#6)
        wrapper.querySelectorAll('a').forEach(link => link.setAttribute('href', link.href));
      
        // For tables, remove all immediate child nodes that are not required
        const tables = wrapper.querySelectorAll('table');
        for (const table of tables) {
          const floaters = Array.from(table.children).filter(node => !['THEAD', 'TBODY', 'TR', 'TFOOT'].includes(node.tagName));
          for (const floater of floaters) {
            floater.remove();
          }
        }
      
        if (containerTagName === '') {
          return wrapper.innerHTML;
          }
      
        // For preformatted tags, content needs to be wrapped inside `<code>`
        // or it would not be considered as fenced code block
        if (containerTagName === 'pre') {
          // Classes of parent or container node can be used by GFM plugin to detect language
          const classes = (container.parentNode || container).classList.toString();

          return `
            <div class="${classes}">
              <pre><code>${wrapper.innerHTML}</code></pre>
            </div>
          `;
        }

        return '<' + containerTagName + '>' + wrapper.innerHTML + '</' + containerTagName + '>';
      },
      args: []
    });

    htmlContent = completionData[0].result;
  }

  const markdownData = NodeHtmlMarkdown.translate(htmlContent)

  await browser.scripting.executeScript({
    target : {tabId : tab.id, allFrames : true},
    func: (markdownValue) => { 
      navigator.clipboard.writeText(markdownValue);
    },
    args: [markdownData]
  });

});
