const PassfileCrypto = (() => {

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    // Derive a 256-bit AES-GCM key from a password + salt (the 8 char transfer code)
    const deriveKey = async (password, salt) => {
        const baseKey = await crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode(salt),
                iterations: 250000,
                hash: "SHA-256"
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    };

    // Encrypt a File object. Returns a Blob of: [IV (12 bytes)] + [encrypted data]
    const encryptFile = async (file, password, transferCode) => {
        const key = await deriveKey(password, transferCode);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const fileBuffer = await file.arrayBuffer();

        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            fileBuffer
        );

        // Prepend IV to the encrypted payload so we can extract it on decrypt
        const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.byteLength);

        return new Blob([combined], { type: "application/octet-stream" });
    };

    // Decrypt an ArrayBuffer of: [IV (12 bytes)] + [encrypted data]
    // Returns a Blob with the original file's MIME type
    const decryptFile = async (encryptedBuffer, password, transferCode, mimeType = "application/octet-stream") => {
        const key = await deriveKey(password, transferCode);

        const data = new Uint8Array(encryptedBuffer);
        const iv = data.slice(0, 12);
        const ciphertext = data.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
        );

        return new Blob([decrypted], { type: mimeType });
    };

    // Helper: trigger a browser download from a Blob
    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Helper: build a FormData payload with the encrypted blob + original filename + code
    const buildUploadPayload = async (files, password, transferCode) => {
        const formData = new FormData();
        for (const file of files) {
            const encryptedBlob = await encryptFile(file, password, transferCode);
            formData.append("file", encryptedBlob, file.name);
        }
        formData.append("code", transferCode);

        return formData;
    };

    // Helper: fetch an encrypted file from the server, decrypt it, trigger download
    const fetchAndDecrypt = async (downloadUrl, password, transferCode, filename, mimeType) => {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error(`Download failed: ${response.status}`);

        const encryptedBuffer = await response.arrayBuffer();
        const decryptedBlob = await decryptFile(encryptedBuffer, password, transferCode, mimeType);
        downloadBlob(decryptedBlob, filename);
    };

    return {
        deriveKey,
        encryptFile,
        decryptFile,
        downloadBlob,
        buildUploadPayload,
        fetchAndDecrypt
    };

})();
