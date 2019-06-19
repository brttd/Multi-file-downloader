# Multi-File Downloader

[View on Chrome web store](https://chrome.google.com/webstore/detail/multi-file-downloader/dpecplbkinpdbedgejddhepkgcppgchk)

> Quickly and easily search and download files linked in websites.
Click the extension button (on the Chrome toolbar), filter results to only include files you want, and then download them all!
>
>Files of any type can be found and downloaded. Any link with a valid file URL or download information will be scanned, and you can also find images and videos displayed in sites.
The resulting file list can be filtered to include or exclude files based on each URL, file name, or type.
Individual files can be downloaded on their own, or all the enabled files downlaoded at once.
Downloads can be automatically placed in a sub-folder of Chrome's downloads directory and given a custom name.

---

### background.js
Chrome extension background script, handles actual file downloads (info sent via chrome.runtime)

### options.html / options.js
Basic options page, uses popup.css for styling and a small script to save options to chrome sync storage.

### page_script.js
Injected into the active tab when the extension popup is shown, searches for links and media elements to get file download URLS.

### popup.html / popup.js
Shows file list, filtering options, download options, and a download status bar.

