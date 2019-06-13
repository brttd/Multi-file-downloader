document.getElementById('status').textContent = ''
chrome.runtime.sendMessage('executeScript')

const options = {
    include_media: false,
    include_website_links: false,

    filter_regex: null,

    filter_name: '',
    filter_name_exclude: '',

    filter_ext: '',
    filter_ext_exclude: '',

    filters: {
        name: [],
        name_exclude: [],

        ext: [],
        ext_exclude: []
    },

    download_subdirectory: '',
    download_overwrite: false,
    download_custom_name: false
}

const elements = {
    status: document.getElementById('status'),
    controls: document.getElementById('controls'),
    actions: document.getElementById('actions'),
    list: document.getElementById('list')
}

const fileEntryElementPool = []

let activeTabUrl = null

let fileExtRegex = new RegExp(/\.([0-9a-z]+)(?:[\?#]|$)/i)
let dotRegex = new RegExp(/\./)
let invalidPathRegex = new RegExp(/:[\\\/]/)
let newlineRegex = new RegExp(/\n/g)

let webFileTypes = [
    'asp',
    'aspx',
    'axd',
    'asx',
    'asmx',
    'ashx',
    'css',
    'cfm',
    'yaws',
    'swf',
    'html',
    'htm',
    'xhtml',
    'jhtml',
    'jsp',
    'jspx',
    'wss',
    'do',
    'action',
    'js',
    'pl',
    'php',
    'php5',
    'php4',
    'php3',
    'phtml',
    'py',
    'rb',
    'rhtml',
    'xml',
    'rss',
    'cgi',
    'dll'
]

let allFiles = []

function textareaInputEvent(event) {
    if (event.keyCode === 13) {
        event.preventDefault()
        return false
    }

    if (this.value.match(newlineRegex)) {
        this.value = this.value.replace(newlineRegex, '')
    }

    allFiles[this.parentNode._index].name = this.value

    this.style.height = ' 0'
    this.style.height = this.scrollHeight + 'px'
}
function textareaBlurEvent() {
    this.value = this.value.trim()

    if (!this.value) {
        this.value = allFiles[this.parentNode._index]._originalName
    }

    allFiles[this.parentNode._index].name = this.value

    this.style.height = ' 0'
    this.style.height = this.scrollHeight + 'px'
}

function getFileExt(url) {
    url = url
        .split('/')
        .pop()
        .match(fileExtRegex)

    return url ? url[1].toLowerCase() : ''
}
function getFileDomain(url) {
    var domain = url.split('/')[url.indexOf('://') == -1 ? 0 : 2]
    return domain.split(':')[0]
}
function getFileName(url) {
    return url.split('/').pop()
}

function getFileEntryElement() {
    if (fileEntryElementPool.length > 0) {
        return fileEntryElementPool.pop()
    }

    let elem = document.createElement('li')

    elem.appendChild(document.createElement('button'))
    elem.lastChild.className = 'toggle-button'
    elem.lastChild.textContent = '✔'

    elem.appendChild(document.createElement('span'))
    elem.lastChild.className = 'domain'

    elem.appendChild(document.createElement('span'))
    elem.lastChild.className = 'url'

    elem.appendChild(document.createElement('textarea'))
    elem.lastChild.className = 'name'
    elem.lastChild.wrap = 'soft'
    elem.lastChild.cols = '1'
    elem.lastChild.rows = '1'
    elem.lastChild.spellcheck = 'false'
    elem.lastChild.addEventListener('input', textareaInputEvent)
    elem.lastChild.addEventListener('change', textareaInputEvent)
    elem.lastChild.addEventListener('blur', textareaBlurEvent)

    elem.appendChild(document.createElement('span'))
    elem.lastChild.className = 'type'

    elem.appendChild(document.createElement('button'))
    elem.lastChild.className = 'download-button'
    elem.lastChild.textContent = '⬇'

    return elem
}

function listFile(file) {
    let entry = getFileEntryElement()

    if (file.enabled) {
        entry.className = ''
        entry.children[0].textContent = '✔'
    } else {
        entry.children[0].textContent = '✖'
        entry.className = 'disabled'
    }

    entry.children[1].textContent = getFileDomain(file.url)
    entry.children[2].textContent = file.url
    entry.children[3].value = file.name || getFileName(file.url)
    entry.children[4].textContent = getFileExt(file.url)

    entry._index = allFiles.indexOf(file)

    elements.list.appendChild(entry)

    textareaBlurEvent.call(entry.children[3])
}

function filterFileResult(file) {
    if (!options.include_media && file.media) {
        return false
    }

    let ext = getFileExt(file.url)

    if (!options.include_website_links && webFileTypes.includes(ext)) {
        return false
    }

    if (options.filters.ext) {
        let found = false

        for (let i = 0; i < options.filters.ext.length; i++) {
            if (ext.includes(options.filters.ext[i])) {
                found = true
                break
            }
        }

        if (!found) {
            return false
        }
    }
    if (options.filters.ext_exclude) {
        for (let i = 0; i < options.filters.ext_exclude.length; i++) {
            if (ext.includes(options.filters.ext_exclude[i])) {
                return false
            }
        }
    }

    if (options.filters.name) {
        let found = false

        for (let i = 0; i < options.filters.name.length; i++) {
            if (file.url.includes(options.filters.name[i])) {
                found = true
                break
            }
        }

        if (!found) {
            return false
        }
    }
    if (options.filters.name_exclude) {
        for (let i = 0; i < options.filters.name_exclude.length; i++) {
            if (file.url.includes(options.filters.name_exclude[i])) {
                return false
            }
        }
    }

    return true
}

function updateList() {
    if (options.filter_name) {
        options.filters.name = options.filter_name
            .split(',')
            .filter(name => name.trim().length > 0)
            .map(name => name.trim())
    } else {
        options.filters.name = null
    }
    if (options.filter_name_exclude) {
        options.filters.name_exclude = options.filter_name_exclude
            .split(',')
            .filter(name => name.trim().length > 0)
            .map(name => name.trim())
    } else {
        options.filters.name_exclude = null
    }

    if (options.filter_ext) {
        options.filters.ext = options.filter_ext
            .split(',')
            .filter(ext => ext.trim().length > 0)
            .map(ext => ext.trim())
    } else {
        options.filters.ext = null
    }
    if (options.filter_ext_exclude) {
        options.filters.ext_exclude = options.filter_ext_exclude
            .split(',')
            .filter(ext => ext.trim().length > 0)
            .map(ext => ext.trim())
    } else {
        options.filters.ext_exclude = null
    }

    while (elements.list.childElementCount > 0) {
        fileEntryElementPool.push(
            elements.list.removeChild(elements.list.lastElementChild)
        )
    }

    for (let i = 0; i < allFiles.length; i++) {
        if (filterFileResult(allFiles[i])) {
            allFiles[i].active = true

            listFile(allFiles[i])
        } else {
            allFiles[i].active = false
        }
    }
}

function downloadFile(file) {
    chrome.runtime.sendMessage({
        download: true,

        url: file.url,
        name: options.download_custom_name ? file.name : null,
        subdirectory: options.download_subdirectory,

        conflictAction: options.download_overwrite ? 'overwrite' : 'uniquify'
    })
}

//Interface setup
{
    function onBoolOptionChange(optionName) {
        options[optionName] = this.checked

        updateList()
    }
    function onOptionChange(optionName) {
        console.log(optionName, this.value)
        options[optionName] = this.value

        updateList()
    }

    function getOptionElem(
        optionName,
        optionType,
        optionLabel,
        interactCallback
    ) {
        if (optionType === 'button') {
            let elem = document.createElement('button')
            elem.className = optionName

            elem.textContent = optionLabel

            elem.addEventListener('click', interactCallback)

            return elem
        }

        if (!optionName) {
            optionName = optionLabel.replace(/ /, '_')
        }

        let elem = document.createElement('div')

        if (optionLabel) {
            elem.appendChild(document.createElement('label'))
            elem.lastChild.textContent = optionLabel
            elem.lastChild.setAttribute('for', 'OPTION_' + optionName)
        }

        elem.appendChild(document.createElement('input'))
        elem.lastChild.type = optionType
        elem.lastChild.id = 'OPTION_' + optionName

        if (optionType === 'checkbox') {
            elem.insertBefore(elem.lastChild, elem.firstChild)

            elem.className = 'checkbox'

            if (interactCallback) {
                elem.firstChild.addEventListener(
                    'change',
                    interactCallback.bind(elem.firstChild)
                )
            } else {
                elem.firstChild.addEventListener(
                    'change',
                    onBoolOptionChange.bind(elem.firstChild, optionName)
                )
            }
        } else {
            if (interactCallback) {
                elem.lastChild.addEventListener(
                    'input',
                    interactCallback.bind(elem.lastChild)
                )
            } else {
                elem.lastChild.addEventListener(
                    'input',
                    onOptionChange.bind(elem.lastChild, optionName)
                )
            }
        }

        return elem
    }

    elements.controls.appendChild(
        getOptionElem('include_media', 'checkbox', 'Media')
    )
    elements.controls.appendChild(
        getOptionElem('include_website_links', 'checkbox', 'Web links')
    )
    elements.controls.appendChild(document.createElement('hr'))

    elements.controls.appendChild(document.createElement('div'))
    elements.controls.lastChild.className = 'multi'
    elements.controls.lastChild.appendChild(
        getOptionElem('filter_name', 'text', 'Filter by name')
    )
    elements.controls.lastChild.appendChild(
        getOptionElem('', 'checkbox', 'Exclude by name', function(e) {
            let elem = document.getElementById('OPTION_filter_name_exclude')

            if (this.checked) {
                elem.disabled = false

                options.filter_name_exclude = elem.value
            } else {
                elem.disabled = true

                options.filter_name_exclude = ''
            }

            updateList()
        })
    )
    elements.controls.lastChild.appendChild(
        getOptionElem('filter_name_exclude', 'text', '')
    )
    document.getElementById('OPTION_filter_name_exclude').disabled = true

    elements.controls.appendChild(document.createElement('div'))
    elements.controls.lastChild.className = 'multi'
    elements.controls.lastChild.appendChild(
        getOptionElem('filter_ext', 'text', 'Filter by type')
    )
    elements.controls.lastChild.appendChild(
        getOptionElem('', 'checkbox', 'Exclude by type', function(e) {
            let elem = document.getElementById('OPTION_filter_ext_exclude')

            if (this.checked) {
                elem.disabled = false

                options.filter_ext_exclude = elem.value
            } else {
                elem.disabled = true

                options.filter_ext_exclude = ''
            }

            updateList()
        })
    )
    elements.controls.lastChild.appendChild(
        getOptionElem('filter_ext_exclude', 'text', '')
    )
    document.getElementById('OPTION_filter_ext_exclude').disabled = true

    elements.controls.appendChild(document.createElement('hr'))

    elements.controls.appendChild(
        getOptionElem('download_subdirectory', 'text', 'Sub-folder', function(
            event
        ) {
            if (this.value.includes('.')) {
                this.value = this.value.replace(dotRegex, '')
            }

            if (this.value.match(invalidPathRegex)) {
                this.value = this.value.replace(invalidPathRegex, '')
            }

            options.download_subdirectory = this.value
        })
    )
    elements.controls.appendChild(document.createElement('hr'))
    elements.controls.appendChild(
        getOptionElem('download_overwrite', 'checkbox', 'Overwrite existing')
    )
    elements.controls.appendChild(
        getOptionElem('download_custom_name', 'checkbox', 'Use custom name')
    )

    elements.actions.appendChild(
        getOptionElem('', 'button', 'Enable All', () => {
            for (let i = 0; i < allFiles.length; i++) {
                allFiles[i].enabled = true
            }
            for (let i = 0; i < list.childNodes.length; i++) {
                list.childNodes[i].className = ''
                list.childNodes[i].firstChild.textContent = '✔'
            }
        })
    )

    elements.actions.appendChild(
        getOptionElem('highlight', 'button', 'Download All', () => {
            for (let i = 0; i < allFiles.length; i++) {
                if (allFiles[i].active && allFiles[i].enabled) {
                    downloadFile(allFiles[i])
                }
            }
        })
    )

    elements.actions.appendChild(
        getOptionElem('', 'button', 'View Downloads', () => {
            chrome.tabs.create({ url: 'chrome://downloads' })
        })
    )
}

chrome.runtime.onMessage.addListener(message => {
    if (typeof message !== 'object') {
        return false
    }

    if (message.message) {
        elements.status.textContent = message.message
        return false
    }

    if (message.files) {
        if (message.url !== activeTabUrl) {
            return false
        }

        elements.status.textContent = ''

        allFiles = []

        for (let i = 0; i < message.files.length; i++) {
            message.files[i].active = false
            message.files[i].enabled = true
            message.files[i]._originalName = message.files[i].name

            allFiles.push(message.files[i])
        }

        updateList()
    }
})

chrome.tabs.query(
    { active: true, lastFocusedWindow: true, currentWindow: true },
    tabs => {
        if (tabs.length > 0) {
            activeTabUrl = tabs[0].url
        }
    }
)

elements.list.addEventListener('click', event => {
    if (event.target.tagName !== 'BUTTON') {
        return false
    }

    let index = event.target.parentNode._index

    if (index < 0 || index >= allFiles.length) {
        return false
    }

    if (event.target.className === 'toggle-button') {
        allFiles[index].enabled = !allFiles[index].enabled

        if (allFiles[index].enabled) {
            event.target.parentNode.className = ''
            event.target.textContent = '✔'
        } else {
            event.target.textContent = '✖'
            event.target.parentNode.className = 'disabled'
        }
    } else if (event.target.className === 'download-button') {
        downloadFile(allFiles[index])
    }
})
