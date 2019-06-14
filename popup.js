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
    download_select_location: false,

    use_link_text: false
}

const elements = {
    status: document.getElementById('status'),
    download_status: document.getElementById('download_status')
        .firstElementChild,
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

let downloaded_urls = []

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
    elem.lastChild.spellcheck = false
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
    let name = file.name.toLowerCase()

    if (options.filters.name) {
        let found = false

        for (let i = 0; i < options.filters.name.length; i++) {
            if (
                url.includes(options.filters.name[i]) ||
                name.includes(options.filters.name[i])
            ) {
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
            if (
                url.includes(options.filters.name_exclude[i]) ||
                name.includes(options.filters.name_exclude[i])
            ) {
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

        source: activeTabUrl,

        url: file.url,
        name: options.download_custom_name ? file.name : null,
        subdirectory: options.download_subdirectory,

        select_location: options.download_select_location,

        conflictAction: options.download_overwrite ? 'overwrite' : 'uniquify'
    })

    if (!downloaded_urls.includes(file.url)) {
        downloaded_urls.push(file.url)
    }
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
        document.getElementById('OPTION_filter_name_exclude').style.display = ''

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
        document.getElementById('OPTION_filter_ext_exclude').style.display = ''

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
            } else {
                document.body.parentElement.style.width = '1000vw'
            }
        }
    )
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
                chrome.storage.sync.get(optionName, result => {
                    elem.firstChild.checked = result[optionName]
                    onBoolOptionChange.call(elem.firstChild, optionName)
                })

                elem.firstChild.addEventListener(
                    'change',
                    saveBoolOptionToStorage.bind(elem.firstChild, optionName)
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
                chrome.storage.sync.get(optionName, result => {
                    if (result.hasOwnProperty(optionName)) {
                        elem.lastChild.value = result[optionName]
                        onOptionChange.call(elem.lastChild, optionName)
                    }
                })

                elem.lastChild.addEventListener(
                    'input',
                    saveOptionToStorage.bind(elem.lastChild, optionName)
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
        getOptionElem('filter_regex', 'text', 'RegExp URL filter')
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
                elem.style.display = ''

                options.filter_name_exclude = elem.value
            } else {
                elem.style.display = 'none'

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
    document.getElementById('OPTION_filter_name_exclude').style.display = 'none'

    elements.controls.appendChild(document.createElement('div'))
    elements.controls.lastChild.className = 'multi'
    elements.controls.lastChild.appendChild(
        getOptionElem('filter_ext', 'text', 'Filter by type')
    )
    elements.controls.lastChild.appendChild(
        getOptionElem('', 'checkbox', 'Exclude by type', function(e) {
            let elem = document.getElementById('OPTION_filter_ext_exclude')

            if (this.checked) {
                elem.style.display = ''

                options.filter_ext_exclude = elem.value
            } else {
                elem.style.display = 'none'

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
    document.getElementById('OPTION_filter_ext_exclude').style.display = 'none'

    elements.actions.appendChild(
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

    elements.actions.appendChild(
        getOptionElem(
            'download_overwrite',
            'checkbox',
            'Overwrite existing',
            null,
            true
        )
    )

    elements.actions.appendChild(
        getOptionElem(
            'download_custom_name',
            'checkbox',
            'Use custom name',
            null,
            true
        )
    )
    elements.actions.appendChild(
        getOptionElem(
            'download_select_location',
            'checkbox',
            'Show save dialog',
            null,
            true
        )
    )

    elements.actions.appendChild(document.createElement('hr'))

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
            let duplicates = []

            for (let i = 0; i < allFiles.length; i++) {
                if (allFiles[i].active && allFiles[i].enabled) {
                    if (downloaded_urls.includes(allFiles[i].url)) {
                        duplicates.push(allFiles[i])
                    } else {
                        downloadFile(allFiles[i])
                    }
                }
            }

            if (duplicates.length > 0) {
                let message = ''

                if (duplicates.length === 1) {
                    message =
                        '1 of the enabled files has already been sent to the download queue! Do you want to download it again?'
                } else {
                    message =
                        duplicates.length.toString() +
                        ' of the enabled files have already been sent to the download queue! Do you want to download them again?'
                }

                if (confirm(message)) {
                    for (let i = 0; i < duplicates.length; i++) {
                        downloadFile(duplicates[i])
                    }
                }
            }
        })
    )

    elements.actions.appendChild(document.createElement('p'))

    elements.actions.appendChild(
        getOptionElem('', 'button', 'Rescan Page', () => {
            scanPage()
        })
    )

    elements.actions.appendChild(
        getOptionElem('use_link_text', 'checkbox', 'Scan link text', null, true)
    )

    elements.actions.appendChild(document.createElement('p'))

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

//Help setup
{
    let helpButton = getOptionElem('', 'button', 'Help', () => {
        showHelp()
    })

    let help = [
        {
            element: helpButton,
            name: 'Help',
            text: `Multi-File Downloader is an extension to make finding and downloading files linked in a website simple and quick.
When the downloader popup is open (like now), the active tab will be scanned for links and other file download information. The files found are then displayed in a list. They can be filtered by specific names or types, and then downloaded.

Occasionally websites use interactive links or other types of buttons, so that the actual file URL is only accessible after clicking a link. When a site does this, Multi-File downloader will be unable to find those files, and they will be missing from the file list.

You can view this help at any time by clicking the 'Help' button.
The different help parts are listed below, click on one to see more information about it.`
        },
        {
            element: elements.controls,
            name: 'Filters',
            text: `'Media': Include visible images and videos found on a page (Links to images or videos are not affected by this filter).
'Web links': Include links to urls with extensions commonly used for websites (.html, .php, etc).

'Filter by name': Only include files where the URL or name includes the given filter.
'Filter by type': Only include files where the file type (extension) includes the given filter.

For both filters the default is to only include files which match the filter. You can also exclude files which match the filter, with the 'Exclude by...' option.
Multiple filters can be used by entering a comma separated list.`
        },
        {
            element: elements.list.parentNode,
            name: 'Files',
            text: `All files which match the filters are shown here.
The Domain, full URL, Name, and Type are shown for each file in their respective columns.
The Name entry can be edited.
Each file can be enabled or disabled by clicking the toggle button in the leftmost column.
Each file can be downloaded individually by clicking the download button in the rightmost column.`
        },
        {
            element: elements.actions,
            name: 'Downloading',
            text: `'Sub-folder': A sub-folder of Chrome's download directory, into which files will be downloaded. Due to limitations with Chrome's downloads, files can only be downloaded to a location within Chrome's download directory.

'Overwrite existing': If enabled, downloads will overwrite any already existing file with the same name.
'Use custom name': If enabled, downloads will use whatever name is set in the Name entry as their filename.
'Show save dialog': If enabled, will show the Save As dialog for every download.

'Enable All': Enables all listed files.
'Download All': Downloads all listed files which are enabled.`
        },
        {
            element: elements.actions,
            name: 'Options',
            text: `'Rescan Page': Re-search the active tab for links to files. This will remove any changes you've made to file names.
'Scan link text': Will take link text and use as the file name.

'View Downloads': Opens Chrome's downloads page.
'Open Options': Opens Multi-File Downloader extension options.
'Help': Opens the help, which you're viewing now.`
        },
        {
            element: elements.download_status.parentNode,
            name: 'Downloads Status',
            text: `Displays how many files are currently being downloaded.

'Cancel From This Tab': Cancels all currently in-progress downloads which were downloaded from the active tab (or from any other tab with the same URL).
'Cancel All': Cancels all currently in-progress downloads.`
        }
    ]

    let activeIndex = -1

    let helpElem = document.createElement('div')
    helpElem.id = 'help'
    helpElem.style.display = 'none'

    let nameElem = document.createElement('h2')
    let textElem = document.createElement('p')

    function showHelp(index = 0) {
        if (index < 0 || index >= help.length) {
            index = 0
        }
        activeIndex = index

        nameElem.textContent = help[index].name
        textElem.textContent = help[index].text

        let elem = document.querySelector('.help-highlight')
        if (elem) {
            elem.classList.remove('help-highlight')
        }

        elem = help[index].element

        elem.classList.add('help-highlight')

        let spaceAbove = elem.offsetTop
        let spaceBelow =
            window.innerHeight - (elem.offsetTop + elem.offsetHeight)

        if (spaceAbove > spaceBelow) {
            helpElem.style.bottom =
                (window.innerHeight - spaceAbove).toString() + 'px'
            helpElem.style.top = ''

            helpElem.style.maxHeight = (spaceAbove - 5).toString() + 'px'
        } else {
            helpElem.style.top =
                (elem.offsetTop + elem.offsetHeight).toString() + 'px'
            helpElem.style.bottom = ''

            helpElem.style.maxHeight = (spaceBelow - 5).toString() + 'px'
        }

        helpElem.style.display = ''
    }

    elements.actions.appendChild(helpButton)

    helpElem.appendChild(document.createElement('div'))
    helpElem.lastChild.appendChild(nameElem)
    helpElem.appendChild(textElem)

    helpElem.appendChild(document.createElement('ul'))

    helpElem.firstChild.appendChild(document.createElement('a'))
    helpElem.firstChild.lastChild.textContent = 'Close'
    helpElem.firstChild.lastChild.addEventListener('click', () => {
        helpElem.style.display = 'none'

        let elem = document.querySelector('.help-highlight')
        if (elem) {
            elem.classList.remove('help-highlight')
        }

        activeIndex = -1
    })

    for (let i = 0; i < help.length; i++) {
        helpElem.lastChild.appendChild(document.createElement('a'))
        helpElem.lastChild.lastChild.textContent = help[i].name

        helpElem.lastChild.lastChild.addEventListener(
            'click',
            showHelp.bind(null, i)
        )
    }

    window.addEventListener('resize', () => {
        if (activeIndex !== -1) {
            showHelp(activeIndex)
        }
    })

    document.body.appendChild(helpElem)

    chrome.storage.local.get('help_shown_2-1', result => {
        if (!result['help_shown_2-1']) {
            showHelp()

            let obj = {}
            obj['help_shown_2-1'] = true

            chrome.storage.local.set(obj)
        }
    })
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

    if (typeof message.downloads === 'object') {
        console.log(message.downloads)

        if (message.downloads.active === 0) {
            elements.download_status.textContent = 'No active downloads'
            elements.download_status.parentNode.className = ''
        } else if (message.downloads.active === 1) {
            elements.download_status.textContent = '1 active download'
            elements.download_status.parentNode.className = 'active'
        } else {
            elements.download_status.textContent =
                message.downloads.active.toString() + ' active downloads'

            elements.download_status.parentNode.className = 'active'
        }

        if (message.downloads.active > 0 || message.downloads.waiting > 0) {
            cancelActiveButton.disabled = false
            cancelAllButton.disabled = false
        } else {
            cancelActiveButton.disabled = true
            cancelAllButton.disabled = true
        }

        if (message.downloads.waiting >= 1) {
            elements.download_status.textContent +=
                ', ' + message.downloads.waiting.toString() + ' waiting.'
        } else {
            elements.download_status.textContent += '.'
        }
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
        if (downloaded_urls.includes(allFiles[index].url)) {
            if (
                confirm(
                    'This file has already been sent to the download queue! Do you want to download it again?'
                )
            ) {
                downloadFile(allFiles[index])
            }
        } else {
            downloadFile(allFiles[index])
        }
    }
})

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

chrome.runtime.sendMessage('get-stats')

let cancelActiveButton = document.createElement('button')
cancelActiveButton.textContent = 'Cancel From This Tab'

let cancelAllButton = document.createElement('button')
cancelAllButton.textContent = 'Cancel All'

cancelActiveButton.addEventListener('click', () => {
    if (activeTabUrl) {
        chrome.runtime.sendMessage({
            cancel_downloads: true,
            url: activeTabUrl
        })
    }
})
cancelAllButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel all downloads?')) {
        chrome.runtime.sendMessage({
            cancel_downloads: true
        })
    }
})

elements.download_status.parentNode.appendChild(cancelActiveButton)
elements.download_status.parentNode.appendChild(cancelAllButton)
