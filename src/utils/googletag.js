export function gtagClick(name, param) {
    console.log('param: ', name, param);
    if (typeof gtag !== 'undefined') {
        console.log('in');
        gtag('event', name, param);
    }
}