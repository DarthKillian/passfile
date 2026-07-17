if (window.location.href == "http://127.0.0.1:5000/") {
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

    const processFiles = async () => {

        const getCode = async () => {
            let request = await fetch("/code/gencode", {
                method: "POST",
            });
            let data = await request.json();
            document.getElementById('code').textContent = `Your Share Code: ${data.code}`;
            return data.code;
        };

        let code = await getCode();

        let totalBytes = 0;
        if (fileInput.files.length == 0) return;

        document.querySelector('#listFiles').innerHTML = '';
        let fileCounter = 0;
        for (const file of fileInput.files) {
            totalBytes += file.size;
            fileCounter += 1;

            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between');

            const fileSpan = document.createElement('span');
            const nameSpan = document.createElement('span');
            const sizeSpan = document.createElement('span');
            const iconSpan = document.createElement('span');
            const icon = document.createElement('i');

            iconSpan.style.display = "none";
            iconSpan.style.paddingRight = "5px";
            icon.style.fontSize = "20px";


            nameSpan.textContent = file.name;
            sizeSpan.textContent = formatSize(file.size);
            fileSpan.append(iconSpan, nameSpan);
            li.appendChild(fileSpan);
            li.appendChild(sizeSpan);
            listFiles.append(li);

            (async () => {

                const payload = await PassfileCrypto.buildUploadPayload(file, password, code);
                let request = await fetch("/drop/upload", {
                    method: "POST",
                    body: payload
                });

                let response = await request.json();
                iconSpan.id = `${response.status}_${fileCounter}`;
                iconSpan.style.display = "inline-block";
                iconSpan.append(icon);
                // Display success or failure icons
                if (parseInt(response.status) == 200) {
                    icon.classList.add('far', 'fa-check-circle', 'text-success');
                } else {
                    icon.classList.add('far', 'fa-times-circle', 'text-danger')
                }

                console.log(response);
            })();
        }
        totalFileSize.textContent = formatSize(totalBytes);

    };

    // Select file(s) even listener
    selectBtn.addEventListener('click', () => fileInput.click());

    // If files are selected, we change the view and iterate over the files to get their name and size
    fileInput.addEventListener('change', () => {
        topHeading.style.display = "none";
        fileSelectDiv.style.display = "none";
        bottomView.style.display = "none";

        password = null;
        passwordInput.value = '';
        passwordModal.show();
    });

    // Wait for the password prompt modal to open so that we can put the cursor in the input box
    passwordPrompt.addEventListener('shown.bs.modal', () => {
        passwordInput.focus();
    });

    // Hitting enter while in the password field triggers a submit. We want to trigger the savePasswordBtn which checks if the password is valid
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
            processFiles();
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
}