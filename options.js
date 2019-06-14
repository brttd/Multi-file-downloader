let inputs = document.querySelectorAll('input')

function onCheckboxChange() {
    let obj = {}
    obj[this.id] = this.checked

    chrome.storage.sync.set(obj)
}
function onInputChange() {
    let obj = {}
    obj[this.id] = this.value

    if (this.type === 'number') {
        obj[this.id] = parseFloat(this.value)

        console.log(obj[this.id])

        if (!isFinite(obj[this.id])) {
            obj[this.id] = parseFloat(this.getAttribute('value'))
        }

        console.log(obj[this.id])
    }

    chrome.storage.sync.set(obj)
}

for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type === 'checkbox') {
        inputs[i].addEventListener('change', onCheckboxChange)
    } else {
        inputs[i].addEventListener('input', onInputChange)
    }

    chrome.storage.sync.get(inputs[i].id, result => {
        if (inputs[i].type === 'checkbox') {
            if (typeof result[inputs[i].id] === 'boolean') {
                inputs[i].checked = result[inputs[i].id]
            }
        } else {
            if (result[inputs[i].id]) {
                inputs[i].value = result[inputs[i].id]
            }
        }
    })
}
