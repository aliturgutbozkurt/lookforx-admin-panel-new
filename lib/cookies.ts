export const CookieUtils = {
  get: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  set: (name: string, value: string, days: number = 7): void => {
    if (typeof window === 'undefined') return;
    
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
  },

  remove: (name: string): void => {
    if (typeof window === 'undefined') return;
    document.cookie = name  + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
};
