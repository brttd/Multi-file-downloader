let active_downloads = []
let download_ids = []

let to_download_list = []

let requesting_download = false

function processDownloadQueue() {
    if (requesting_download || to_download_list.length === 0) {
        return false
    }

    requesting_download = true

    let file = to_download_list.shift()

    chrome.downloads.download(
        {
            url: file.url,
            conflictAction: file.conflictAction || 'uniquify',
            saveAs: file.select_location || false
        },
        id => {
            requesting_download = false

            if (id) {
                active_downloads.push({
                    id: id,

                    name: file.name || null,
                    subdirectory: file.subdirectory || null,

                    conflictAction: file.conflictAction || 'uniquify'
                })

                download_ids.push(id)
            }

            processDownloadQueue()
        }
    )
}

function queueDownload(file) {
    to_download_list.push(file)

    processDownloadQueue()
}

chrome.runtime.onMessage.addListener(message => {
    if (typeof message === 'object' && message.download === true) {
        queueDownload(message)
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
        filename: newFilename,
        conflictAction: relevantDownload.conflictAction
    })
})
