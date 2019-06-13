let active_downloads = []
let download_ids = []

function download_file(file) {
    chrome.downloads.download(
        {
            url: file.url,
            conflictAction: file.conflictAction || 'uniquify',
            saveAs: file.select_location || false
        },
        id => {
            if (id) {
                active_downloads.push({
                    id: id,

                    name: file.name || null,
                    subdirectory: file.subdirectory || null,

                    conflictAction: file.conflictAction || 'uniquify'
                })
                download_ids.push(id)
            }
        }
    )
}

chrome.runtime.onMessage.addListener(message => {
    if (typeof message === 'object' && message.download === true) {
        download_file(message)
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
