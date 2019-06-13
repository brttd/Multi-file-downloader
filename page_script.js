window._injected_downloader = window._injected_downloader || false

if (window._injected_downloader) {
    console.info('Downloader page_script.js has already been injected')

    window._downloader_find_files_function()
} else {
    window._injected_downloader = true

    let fileExtRegex = new RegExp(/\.([0-9a-z]+)(?:[\?#]|$)/i)

    function getFileExt(url) {
        url = url
            .split('/')
            .pop()
            .match(fileExtRegex)

        return url ? url[1].toLowerCase() : ''
    }

    function findFiles() {
        let files = []
        //{ name: '', url: '', image: true/false }

        let urls = []

        let links = document.getElementsByTagName('a')
        let images = document.getElementsByTagName('img')
        let videos = document.getElementsByTagName('video')
        let pictures = document.getElementsByTagName('picture')

        for (let i = 0; i < links.length; i++) {
            if (
                !links[i].href.startsWith('mailto:') &&
                !urls.includes(links[i].href)
            ) {
                let fileExt = getFileExt(links[i].href)

                if (fileExt || links[i].hasAttribute('download')) {
                    urls.push(links[i].href)

                    files.push({
                        name:
                            links[i].getAttribute('download') ||
                            links[i].href.split('/').pop(),
                        url: links[i].href,

                        image: false
                    })
                }
            }
        }

        for (let i = 0; i < images.length; i++) {
            if (!urls.includes(images[i].currentSrc)) {
                urls.push(images[i].currentSrc)

                files.push({
                    name: images[i].currentSrc.split('/').pop(),

                    url: images[i].currentSrc,

                    media: true
                })
            }
        }

        for (let i = 0; i < videos.length; i++) {
            if (!urls.includes(videos[i].src)) {
                urls.push(videos[i].src)

                files.push({
                    name: videos[i].src.split('/').pop(),

                    url: videos[i].src,

                    media: true
                })
            }
        }

        for (let i = 0; i < pictures.length; i++) {
            let img = pictures.getElementsByTagName('img').pop()

            if (img && !urls.includes(img.currentSrc)) {
                urls.push(img.currentSrc)

                files.push({
                    name: img.currentSrc.split('/').pop(),

                    url: img.currentSrc,

                    media: true
                })
            }
        }

        chrome.runtime.sendMessage({
            url: window.location.href,

            files: files
        })
    }

    let hijackInfo = {}

    let hijacked_links = []

    function hijackedLinkOpen(url) {
        if (!hijacked_links.includes(url)) {
            hijacked_links.push(url)

            console.log(url)
        }
    }

    function clickLinks(iframe) {
        let links = iframe.contentDocument.getElementsByTagName('a')

        for (let i = 0; i < links.length; i++) {
            links[i].click()
        }
    }

    function beginPageHijack() {
        let iframe = document.createElement('iframe')
        iframe.src = window.location.href

        iframe.style.position = 'fixed'
        iframe.style.top = '200vh'

        document.body.appendChild(iframe)

        iframe.onload = function() {
            let iframeWindow = iframe.contentWindow

            iframeWindow.open = hijackedLinkOpen

            iframeWindow.addEventListener(
                'beforeunload',
                () => {
                    hijackedLinkOpen(location.href)

                    event.preventDefault()
                    event.returnValue = false
                    return false
                },
                {
                    capture: true
                }
            )

            clickLinks(iframe)
        }
    }

    function findFilesExtra() {
        beginPageHijack()
    }

    window._downloader_find_files_function = findFiles
    window._downloader_find_files_extra_function = findFilesExtra

    findFiles()
}
