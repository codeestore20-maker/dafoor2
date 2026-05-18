export const fixEncoding = (str: string) => {
    // If the string already contains Arabic characters, it's likely already correct (UTF-8)
    if (/[\u0600-\u06FF]/.test(str)) {
        return str;
    }
    
    // Try to decode from Latin1 to UTF8
    try {
        const fixed = Buffer.from(str, 'latin1').toString('utf8');
        // If the fixed string reveals Arabic characters, use it
        if (/[\u0600-\u06FF]/.test(fixed)) {
            return fixed;
        }
    } catch (e) {
        // invalid encoding, ignore
    }
    
    return str;
};
