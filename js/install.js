//service workers
if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(reg => {
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          newWorker.onstatechange = () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.location.reload();
            }
          };
        };
      });
      
    })
 } 
 

let deferredPrompt;

document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show the button
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
      // Directly triggered by user click
      installBtn.style.display = 'none';

      // Show the install prompt
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
  });


  //Confirm successful installation.
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
  });
})