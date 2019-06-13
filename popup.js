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
    download_custom_name: false,
    download_select_location: false
}

const elements = {
    status: document.getElementById('status'),
    controls: document.getElementById('controls'),
    actions: document.getElementById('actions'),
    list: document.getElementById('list')
}

const fileEntryElementPool = []

let activeTabUrl = null
let activeTabId = null

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

    let ext = getFileExt(file.url).toLowerCase()

    if (!options.include_website_links && webFileTypes.includes(ext)) {
        return false
    }

    if (
        options.filters.regex &&
        !file.url.toLowerCase().match(options.filters.regex)
    ) {
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

    let url = file.url.toLowerCase()

    if (options.filters.name) {
        let found = false

        for (let i = 0; i < options.filters.name.length; i++) {
            if (url.includes(options.filters.name[i])) {
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
            if (url.includes(options.filters.name_exclude[i])) {
                return false
            }
        }
    }

    return true
}

function updateList() {
    if (options.filter_regex) {
        try {
            options.filters.regex = new RegExp(options.filter_regex)
            elements.regex_message.textContent = ''
        } catch (error) {
            elements.regex_message.textContent = '' + error
            options.filters.regex = null
        }
    } else {
        options.filters.regex = null
        elements.regex_message.textContent = ''
    }

    if (options.filter_name) {
        options.filters.name = options.filter_name
            .toLowerCase()
            .split(',')
            .filter(name => name.trim().length > 0)
            .map(name => name.trim())
    } else {
        options.filters.name = null
    }
    if (options.filter_name_exclude) {
        options.filters.name_exclude = options.filter_name_exclude
            .toLowerCase()
            .split(',')
            .filter(name => name.trim().length > 0)
            .map(name => name.trim())
    } else {
        options.filters.name_exclude = null
    }

    if (options.filter_ext) {
        options.filters.ext = options.filter_ext
            .toLowerCase()
            .split(',')
            .filter(ext => ext.trim().length > 0)
            .map(ext => ext.trim())
    } else {
        options.filters.ext = null
    }
    if (options.filter_ext_exclude) {
        options.filters.ext_exclude = options.filter_ext_exclude
            .toLowerCase()
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

        select_location: options.download_select_location,

        conflictAction: options.download_overwrite ? 'overwrite' : 'uniquify'
    })
}

let lastSaveTime = 0
function updateFilterOptions(filters) {
    if (
        filters.regex &&
        document.querySelector('.regex').style.display === ''
    ) {
        document.getElementById('OPTION_filter_regex').value = filters.regex
        onOptionChange.call(
            document.getElementById('OPTION_filter_regex'),
            'filter_regex'
        )
    }

    if (filters.name) {
        document.getElementById('OPTION_filter_name').value = filters.name
        onOptionChange.call(
            document.getElementById('OPTION_filter_name'),
            'filter_name'
        )
    }
    if (filters.name_exclude) {
        document.getElementById('OPTION_filter_name_exclude').value =
            filters.name_exclude

        document.getElementById('OPTION_Exclude_by name').checked = true
        document.getElementById('OPTION_filter_name_exclude').disabled = false

        onOptionChange.call(
            document.getElementById('OPTION_filter_name_exclude'),
            'filter_name_exclude'
        )
    }

    if (filters.ext) {
        document.getElementById('OPTION_filter_ext').value = filters.ext
        onOptionChange.call(
            document.getElementById('OPTION_filter_ext'),
            'filter_ext'
        )
    }
    if (filters.ext_exclude) {
        document.getElementById('OPTION_filter_ext_exclude').value =
            filters.ext_exclude

        document.getElementById('OPTION_Exclude_by type').checked = true
        document.getElementById('OPTION_filter_ext_exclude').disabled = false

        onOptionChange.call(
            document.getElementById('OPTION_filter_ext_exclude'),
            'filter_ext_exclude'
        )
    }
}
function writeFilterStorage() {
    chrome.storage.local.get('site_filters', result => {
        let activeDomain = getFileDomain(activeTabUrl)

        let newSiteFilters = []

        if (result.site_filters && Array.isArray(result.site_filters)) {
            newSiteFilters = result.site_filters.filter(
                site => site.domain !== activeDomain
            )
        }

        while (newSiteFilters.length > 10) {
            newSiteFilters.shift()
        }

        newSiteFilters.push({
            domain: activeDomain,

            regex:
                document.querySelector('.regex').style.display === ''
                    ? options.filter_regex
                    : null,

            name: options.filter_name,
            name_exclude: options.filter_name_exclude,

            ext: options.filter_ext,
            ext_exclude: options.filter_ext_exclude
        })

        chrome.storage.local.set({
            site_filters: newSiteFilters
        })
    })
}
function saveFilterOptions() {
    setTimeout(() => {
        if (Date.now() - lastSaveTime > 900) {
            lastSaveTime = Date.now()
            writeFilterStorage()
        }
    }, 1000)
}

//Interface setup
{
    function onBoolOptionChange(optionName) {
        options[optionName] = this.checked

        updateList()
    }
    function onOptionChange(optionName) {
        options[optionName] = this.value

        updateList()

        if (optionName.includes('filter')) {
            saveFilterOptions()
        }
    }

    function saveBoolOptionToStorage(optionName) {
        let obj = {}
        obj[optionName] = this.checked

        chrome.storage.sync.set(obj)
    }
    function saveOptionToStorage(optionName) {
        let obj = {}
        obj[optionName] = this.value

        chrome.storage.sync.set(obj)
    }

    function getOptionElem(
        optionName,
        optionType,
        optionLabel,
        interactCallback,
        useStorage
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

            if (typeof interactCallback === 'function') {
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

            if (useStorage) {
                let keyName = 'OPTION_' + optionName

                chrome.storage.sync.get(keyName, result => {
                    elem.firstChild.checked = result[keyName]
                    onBoolOptionChange.call(elem.firstChild, optionName)
                })

                elem.firstChild.addEventListener(
                    'change',
                    saveBoolOptionToStorage.bind(elem.firstChild, keyName)
                )
            }
        } else {
            if (typeof interactCallback === 'function') {
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

            if (useStorage) {
                let keyName = 'OPTION_' + optionName

                chrome.storage.sync.get(keyName, result => {
                    elem.lastChild.value = result[keyName]
                    onOptionChange.call(elem.lastChild, optionName)
                })

                elem.lastChild.addEventListener(
                    'input',
                    saveOptionToStorage.bind(elem.lastChild, keyName)
                )
            }
        }

        return elem
    }

    elements.controls.appendChild(
        getOptionElem('include_media', 'checkbox', 'Media', null, true)
    )
    elements.controls.appendChild(
        getOptionElem(
            'include_website_links',
            'checkbox',
            'Web links',
            null,
            true
        )
    )
    elements.controls.appendChild(document.createElement('hr'))

    elements.controls.appendChild(
        getOptionElem('filter_regex', 'text', 'Filter by RegExp')
    )
    elements.regex_message = document.createElement('label')
    elements.regex_message.className = 'message'
    elements.regex_message.id = 'regex_message'
    elements.controls.lastChild.appendChild(elements.regex_message)
    elements.controls.lastChild.className = 'regex'

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

            onOptionChange.call(
                {
                    value: options.filter_name_exclude
                },
                'filter_name_exclude'
            )
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

            onOptionChange.call(
                {
                    value: options.filter_ext_exclude
                },
                'filter_ext_exclude'
            )
        })
    )
    elements.controls.lastChild.appendChild(
        getOptionElem('filter_ext_exclude', 'text', '')
    )
    document.getElementById('OPTION_filter_ext_exclude').disabled = true

    elements.controls.appendChild(document.createElement('hr'))

    elements.controls.appendChild(
        getOptionElem(
            'download_subdirectory',
            'text',
            'Sub-folder',
            function(event) {
                if (this.value.includes('.')) {
                    this.value = this.value.replace(dotRegex, '')
                }

                if (this.value.match(invalidPathRegex)) {
                    this.value = this.value.replace(invalidPathRegex, '')
                }

                options.download_subdirectory = this.value
            },
            true
        )
    )
    elements.controls.appendChild(document.createElement('hr'))
    elements.controls.appendChild(
        getOptionElem(
            'download_overwrite',
            'checkbox',
            'Overwrite existing',
            null,
            true
        )
    )
    elements.controls.appendChild(
        getOptionElem(
            'download_custom_name',
            'checkbox',
            'Use custom name',
            null,
            true
        )
    )
    elements.controls.appendChild(
        getOptionElem(
            'download_select_location',
            'checkbox',
            'Show save dialog',
            null,
            true
        )
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
        getOptionElem('', 'button', 'Rescan Page', () => {
            scanPage()
        })
    )

    elements.actions.appendChild(document.createElement('hr'))

    elements.actions.appendChild(
        getOptionElem('', 'button', 'View Downloads', () => {
            chrome.tabs.create({ url: 'chrome://downloads' })
        })
    )

    elements.actions.appendChild(
        getOptionElem('', 'button', 'Open Options', () => {
            chrome.runtime.openOptionsPage()
        })
    )
}

chrome.runtime.onMessage.addListener(message => {
    if (typeof message !== 'object') {
        return false
    }

    if (message.message) {
        elements.status.firstChild.textContent = message.message
        elements.status.style.display = ''

        return false
    }

    if (message.files) {
        if (message.url !== activeTabUrl) {
            return false
        }

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

function scanPage() {
    chrome.tabs.executeScript(
        activeTabId,
        {
            file: 'page_script.js'
        },
        e => {
            if (e === undefined) {
                let message = 'Unable to access tab!'

                if (chrome.runtime.lastError) {
                    message += '\n\n' + chrome.runtime.lastError.message
                }

                elements.status.firstElementChild.textContent = message
                elements.status.style.display = ''
            }
        }
    )
}

chrome.tabs.query(
    { active: true, lastFocusedWindow: true, currentWindow: true },
    tabs => {
        if (tabs.length > 0) {
            activeTabUrl = tabs[0].url
            activeTabId = tabs[0].id

            scanPage()

            chrome.storage.local.get('site_filters', result => {
                if (result.site_filters && Array.isArray(result.site_filters)) {
                    let activeDomain = getFileDomain(activeTabUrl)

                    let filters = result.site_filters.find(
                        site => site.domain === activeDomain
                    )

                    if (filters) {
                        updateFilterOptions(filters)
                    }
                }
            })
        } else {
            let message = 'Unable to access tab!\nPlease retry.\n'

            if (chrome.runtime.lastError) {
                message += '\n\n' + chrome.runtime.lastError.message
            }

            elements.status.firstElementChild.textContent = message
            elements.status.style.display = ''
        }
    }
)

chrome.storage.sync.get('regex_enabled', result => {
    if (result.regex_enabled) {
        document.querySelector('.regex').style.display = ''
    } else {
        document.querySelector('.regex').style.display = 'none'
    }
})

chrome.extension.isAllowedFileSchemeAccess(allowed => {
    if (!allowed) {
        console.log('File URL access is not allowed')
    }
})
