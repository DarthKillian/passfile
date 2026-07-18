const createCodeBtn = document.getElementById('createCodeBtn');
const passwordPromt = document.getElementById('passwordPrompt');
const passwordModal = new bootstrap.Modal(passwordPrompt, { keyboard: false });
const passwordInput = document.getElementById('passwordInput');
const closePasswordModal = document.getElementById('closePasswordModal');

createCodeBtn.addEventListener('click', () => {
    (async () => {
        const getCode = async () => {
            let request = await fetch("/drop/create", {
                method: "POST",
            });
            let data = await request.json();
            return data;
        };

        let code = await getCode()
        password = null;
        passwordInput.value = '';
        passwordModal.show();
    })();

});

// Exit button in top right corner event listener - Prevent closing the modal if password constraints aren't satisfied
closePasswordModal.addEventListener('click', (e) => {
    e.preventDefault();
    passwordModal.hide();
});