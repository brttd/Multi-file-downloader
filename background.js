let active_downloads = []
let download_ids = []

function download_file(file) {
    chrome.downloads.download(
        {
            url: file.url,
            conflictAction: file.conflictAction || 'uniquify',
            saveAs: false
        },
        id => {
            if (id) {
                console.log(file.subdirectory)

                active_downloads.push({
                    id: id,

                    name: file.name || null,
                    subdirectory: file.subdirectory || null
                })
                download_ids.push(id)
            } else {
                console.error(chrome.runtime.lastError)
            }
        }
    )
}

chrome.runtime.onMessage.addListener(message => {
    if (message === 'executeScript') {
        chrome.tabs.query(
            { active: true, lastFocusedWindow: true, currentWindow: true },
            tabs => {
                if (tabs.length > 0) {
                    chrome.tabs.executeScript(tabs[0].id, {
                        file: 'page_script.js'
                    })
                } else {
                    chrome.runtime.sendMessage({
                        message: 'Unable to access tab!\nPlease retry.'
                    })
                }
            }
        )

        chrome.tabs.executeScript({
            file: 'page_script.js'
        })
    } else if (typeof message === 'object') {
        if (message.download === true) {
            download_file(message)
        }
    }
})

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    let relevantDownload = active_downloads.find(
        item => item.id === downloadItem.id
    )

    if (!relevantDownload) {
        return false
    }

    let newFilename = downloadItem.filename

    if (relevantDownload.name) {
        newFilename = relevantDownload.name
    }

    if (relevantDownload.subdirectory) {
        newFilename = relevantDownload.subdirectory + '/' + newFilename
    }

    suggest({
        filename: newFilename
    })
})
