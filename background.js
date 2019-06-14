let active_downloads = []

let to_download_list = []

let requesting_download = false

let max_downloads = 30

function processDownloadQueue() {
    if (
        requesting_download ||
        to_download_list.length === 0 ||
        active_downloads.length >= max_downloads
    ) {
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

                    source: file.source,

                    name: file.name || null,
                    subdirectory: file.subdirectory || null,

                    conflictAction: file.conflictAction || 'uniquify'
                })
            }

            sendStatsUpdate()

            processDownloadQueue()
        }
    )
}

function queueDownload(file) {
    to_download_list.push(file)

    processDownloadQueue()

    sendStatsUpdate()
}

function cancelDownloads(url) {
    if (url) {
        for (let i = to_download_list.length - 1; i >= 0; i--) {
            if (to_download_list[i].source === url) {
                console.log('cancel', i)
                to_download_list.splice(i, 1)
            }
        }

        for (let i = active_downloads.length - 1; i >= 0; i--) {
            if (active_downloads[i].source === url) {
                console.log('cancelling', active_downloads[i].id)
                chrome.downloads.cancel(active_downloads[i].id, () => {
                    active_downloads.splice(i, 1)

                    processDownloadQueue()
                    sendStatsUpdate()
                })
            }
        }
    } else {
        to_download_list.splice(0, to_download_list.length)

        for (let i = active_downloads.length - 1; i >= 0; i--) {
            chrome.downloads.cancel(active_downloads[i].id, () => {
                active_downloads.splice(i, 1)

                processDownloadQueue()
                sendStatsUpdate()
            })
        }
    }

    sendStatsUpdate()
}

function sendStatsUpdate() {
    if (active_downloads.length > 0 || to_download_list.length > 0) {
        chrome.browserAction.setBadgeText({
            text: (active_downloads.length + to_download_list.length).toString()
        })
    } else {
        chrome.browserAction.setBadgeText({
            text: ''
        })
    }

    chrome.runtime.sendMessage({
        downloads: {
            active: active_downloads.length,
            waiting: to_download_list.length
        }
    })
}

chrome.browserAction.setBadgeBackgroundColor({
    color: '#116611'
})

chrome.runtime.onMessage.addListener(message => {
    if (message === 'get-stats') {
        sendStatsUpdate()
    }

    if (typeof message === 'object') {
        if (message.download === true) {
            queueDownload(message)
        }

        if (message.cancel_downloads === true) {
            cancelDownloads(message.url)
        }
    }
})

chrome.downloads.onChanged.addListener(downloadItem => {
    let index = active_downloads.findIndex(item => item.id === downloadItem.id)

    if (index === -1) {
        return false
    }

    if (downloadItem.state) {
        if (
            downloadItem.state.current === 'interrupted' ||
            downloadItem.state.current === 'complete'
        ) {
            active_downloads.splice(index, 1)

            processDownloadQueue()

            sendStatsUpdate()
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
        filename: newFilename,
        conflictAction: relevantDownload.conflictAction
    })
})

chrome.storage.sync.get('max_downloads', result => {
    if (
        typeof result.max_downloads === 'number' &&
        isFinite(result.max_downloads)
    ) {
        max_downloads = Math.max(1, ~~result.max_downloads)
    }

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') {
            return false
        }

        if (
            typeof changes.max_downloads === 'object' &&
            typeof changes.max_downloads.newValue === 'number'
        ) {
            if (
                isFinite(changes.max_downloads.newValue) &&
                changes.max_downloads.newValue >= 1
            ) {
                max_downloads = Math.max(1, ~~changes.max_downloads.newValue)
            } else {
                chrome.storage.sync.set({
                    max_downloads: max_downloads
                })
            }
        }
    })
})
