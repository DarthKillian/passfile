const createCodeBtn = document.getElementById('createCodeBtn');

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
        console.log(await code)

    })();
    
});