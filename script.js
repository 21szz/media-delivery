async function logIP() {
    try {
        
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;
        
        
        const webhookURL = 'https://discord.com/api/webhooks/1411453235834654792/m4kwAhRpqLt6BS-uoe6wXE4kmaDOsapMg8t1R-l6zjxLLJbhaFNYpYuKkEzIxHtPKhBK';
        
        const currentTime = new Date().toLocaleString('sv-SE', {
            timeZone: 'Europe/Stockholm',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: `🌐 **new ip logged**\n\`\`\`IP: ${ip}\nTid: ${currentTime}\nSida: ${window.location.href}\nUser-Agent: ${navigator.userAgent}\`\`\``,
                username: 'GitHub IP Logger'
            })
        });
    } catch (error) {
        console.log('Kunde inte logga IP:', error);
    }
}


document.addEventListener('DOMContentLoaded', logIP);