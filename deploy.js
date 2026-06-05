require('dotenv').config();
const ftp = require("basic-ftp");
const path = require("path");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Set to true to see FTP logs

    const host = process.env.FTP_HOST;
    const user = process.env.FTP_USER;
    const password = process.env.FTP_PASSWORD;
    let remotePath = process.env.FTP_REMOTE_PATH || "public_html";
    if (!remotePath.startsWith("/")) {
        remotePath = "/" + remotePath;
    }

    if (!host || !user || !password) {
        console.error("❌ ERROR: Kredensial FTP belum lengkap di file .env");
        console.error("Pastikan FTP_HOST, FTP_USER, dan FTP_PASSWORD sudah terisi.");
        process.exit(1);
    }

    try {
        console.log(`\n🚀 Menghubungkan ke server Hostinger (${host})...`);
        await client.access({
            host: host,
            user: user,
            password: password,
            secure: false
        });

        console.log(`\n📂 Sinkronisasi file ke folder: ${remotePath}`);
        
        // Ensure remote directory exists
        await client.ensureDir("/");
        
        console.log("\n🔍 Listing root directories:");
        const rootList = await client.list();
        for (const item of rootList) {
            console.log(`- ${item.name} (${item.type === 2 ? 'dir' : 'file'})`);
        }

        await client.ensureDir(remotePath);

        // Clear it first, or just upload (overwrite). We will upload and overwrite everything in current directory.
        // Ignore certain files like node_modules, .git, etc.
        console.log(`\n⏳ Mengupload file... (Tunggu sebentar)\n`);
        
        // uploadFromDir will upload entire directory. But we don't want to upload node_modules, .git etc.
        // basic-ftp doesn't have built-in ignore. We have to either upload everything or implement custom sync.
        
        // Using uploadDir but filtering out ignored directories by writing a custom traverse?
        // Wait, basic-ftp has `uploadFrom` but no ignore. 
        // A simple workaround is to copy everything we need to a temp folder, OR just use basic-ftp's uploadDir 
        // with the ignore feature? Unfortunately basic-ftp uploadDir doesn't support ignore natively.
        // Let's implement a quick custom recursive uploader ignoring .git, node_modules, .env.
        
        await uploadDirectory(client, __dirname, remotePath);

        console.log("\n✅ DEPLOY SELESAI! Semua perubahan sudah naik ke Hostinger.");
    }
    catch (err) {
        console.error("\n❌ GAGAL DEPLOY:", err);
    }
    client.close();
}

async function uploadDirectory(client, localDir, remoteDir) {
    const fs = require('fs');
    
    // Create remote dir if not exists
    await client.ensureDir(remoteDir);
    
    const items = fs.readdirSync(localDir);
    
    for (const item of items) {
        // IGNORE THESE FILES & FOLDERS
        if (['node_modules', '.git', '.env', 'deploy.js', '.gitignore', 'package.json', 'package-lock.json', '.DS_Store', '.antigravityignore'].includes(item)) {
            continue;
        }
        
        const localPath = path.join(localDir, item);
        const stat = fs.statSync(localPath);
        
        if (stat.isDirectory()) {
            await uploadDirectory(client, localPath, remoteDir + "/" + item);
            // Go back to the original remote dir
            await client.cd(remoteDir);
        } else {
            console.log(`Uploading: ${item} -> ${remoteDir}/${item}`);
            await client.uploadFrom(localPath, item);
        }
    }
}

deploy();
