const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const topHeading = document.getElementById('topHeading');
const fileSelectDiv = document.getElementById('fileSelectDiv');
const bottomView = document.getElementById('bottomView');
const uploadFiles = document.getElementById('uploadFiles')
const listFiles = document.getElementById('listFiles');
const passwordPromt = document.getElementById('passwordPrompt');
const passwordModal = new bootstrap.Modal(passwordPrompt, { keyboard: false });
const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('passwordInput');
const savePasswordBtn = document.getElementById('savePasswordBtn');
const passwordInvalidTxt = document.getElementById('passwordInvalidTxt');
const closeUploadBtn = document.getElementById('closeUploadBtn');
const totalFileSize = document.getElementById('totalFileSize');
const closePasswordModal = document.getElementById('closePasswordModal');

let password;

// Format file size to human readable kb, mb, gb
const formatSize = (bytes) => {
    if (bytes < 1000 * 1000) {
        return (`${(bytes / 1000).toFixed(1)} KB`);
    } else if (bytes < 1000 * 1000 * 1000) {
        return (`${(bytes / (1000 * 1000)).toFixed(1)} MB`);
    } else {
        return (`${(bytes / (1000 * 1000 * 1000)).toFixed(1)} GB`);
    }
}

// Very simple password validation
const passwordInvalid = (input) => {
    if (input.length <= 7) {
        return true;
    }
};

// Select file(s) even listener
selectBtn.addEventListener('click', () => fileInput.click());

// If files are selected, we change the view and iterate over the files to get their name and size
fileInput.addEventListener('change', () => {
    password = null;
    let totalBytes = 0;
    if (fileInput.files.length == 0) return;
    topHeading.style.display = "none";
    fileSelectDiv.style.display = "none";
    bottomView.style.display = "none";
    document.querySelector('#listFiles').innerHTML = '';
    for (const file of fileInput.files) {
        totalBytes += file.size;

        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between');

        const nameSpan = document.createElement('span');
        const sizeSpan = document.createElement('span');

        nameSpan.textContent = file.name;
        sizeSpan.textContent = formatSize(file.size);

        li.appendChild(nameSpan);
        li.appendChild(sizeSpan);
        listFiles.append(li)
    }
    totalFileSize.textContent = formatSize(totalBytes);
    passwordInput.value = '';
    passwordModal.show();
});

// Wait for the password prompt modal to open so that we can put the cursor in the input box
passwordPrompt.addEventListener('shown.bs.modal', () => {
    passwordInput.focus();
});

// Hitting enter while in the password field triggers a submit. We want to trigger the savePasswordBtn which 
passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePasswordBtn.click();
});

// On form submit, we trigger this or if user clicks, this is called - Check password validity and proceed if it passes
savePasswordBtn.addEventListener('click', () => {
    if (passwordInvalid(passwordInput.value)) {
        passwordInvalidTxt.style.display = "block";
    } else {
        passwordModal.hide();
        password = passwordInput.value;
    }
});

// Exit button in top right corner event listener - Prevent closing the modal if password constraints aren't satisfied
closePasswordModal.addEventListener('click', (e) => {
    e.preventDefault();
    if (passwordInvalid(passwordInput.value)) {
        passwordInvalidTxt.style.display = "block";
    } else {
        passwordModal.hide();
    }
});

// Password modal hidden event verifies password is not null and extra passwordInvalid() sanity check to catch shenanigans.
// If we are shenanigan free, we show the file upload elements
passwordPrompt.addEventListener('hidden.bs.modal', () => {
    if (password == null || password == "" || passwordInvalid(password)) {
        passwordModal.show();
        passwordInvalidTxt.style.display = "block";
    } else {
        uploadFiles.classList.remove('d-none');
        uploadFiles.classList.add('d-flex');
        passwordInvalidTxt.style.display = "none";

        const getCode = async () => {
            let request = await fetch("/upload/getcode", {
                method: "POST",
            });
            let data = await request.json();
            document.getElementById('code').textContent = `Your Share Code: ${data.code}`;
            return data.code;
        };

        (async () => {
            code = await getCode();
            const payload = await PassfileCrypto.buildUploadPayload(fileInput.files, password, code);
            let request = await fetch("/upload", {
                method: "POST",
                body: payload
            });
            
            let response = await request.json();
            console.log(response);
        })();
    }


});

// Hide the upload files "view" and reset to view the main page content again
closeUploadBtn.addEventListener('click', () => {
    topHeading.style.display = "block";
    fileSelectDiv.style.display = "block";
    bottomView.style.display = "block";
    uploadFiles.classList.remove('d-flex');
    uploadFiles.classList.add('d-none');
    password = null;
});