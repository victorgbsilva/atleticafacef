const authTabs = [...document.querySelectorAll('[data-auth-tab]')];
const authPanels = [...document.querySelectorAll('[data-auth-panel]')];
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const registerPanel = document.querySelector('#register-panel');
const verificationPanel = document.querySelector('#verification-panel');
const verificationForm = document.querySelector('#verification-form');
const loginMessage = document.querySelector('#login-message');
const registerMessage = document.querySelector('#register-message');
const verificationMessage = document.querySelector('#verification-message');
const registrationSuccess = document.querySelector('#registration-success');
let verificationEmail = '';

function selectAuthTab(name) {
  const currentTab = authTabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.dataset.authTab;
  if (currentTab && currentTab !== name) {
    loginForm.reset();
    registerForm.reset();
    verificationForm.reset();
    loginMessage.textContent = '';
    registerMessage.textContent = '';
    verificationMessage.textContent = '';
    registerForm.hidden = false;
    verificationPanel.hidden = true;
    verificationEmail = '';
    document.querySelector('#verification-email').textContent = '';
  }
  registrationSuccess.hidden = true;
  authTabs.forEach(tab => {
    const selected = tab.dataset.authTab === name;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  authPanels.forEach(panel => { panel.hidden = panel.dataset.authPanel !== name; });
  if (name === 'login') document.querySelector('#login-user').focus();
  else if (verificationPanel.hidden) document.querySelector('#register-name').focus();
  else document.querySelector('#verification-code').focus();
}

authTabs.forEach(tab => tab.addEventListener('click', () => selectAuthTab(tab.dataset.authTab)));
document.querySelector('[data-open-register]').addEventListener('click', () => selectAuthTab('register'));
authTabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  const nextIndex = (index + (event.key === 'ArrowRight' ? 1 : -1) + authTabs.length) % authTabs.length;
  authTabs[nextIndex].focus();
  selectAuthTab(authTabs[nextIndex].dataset.authTab);
}));

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  window.dispatchEvent(new CustomEvent('xxmarco:login-request'));
  loginMessage.textContent = 'O acesso ainda não está conectado.';
});

registerForm.addEventListener('submit', event => {
  event.preventDefault();
  verificationEmail = String(new FormData(registerForm).get('email') || '').trim();
  document.querySelector('#verification-email').textContent = verificationEmail;
  registerForm.hidden = true;
  verificationPanel.hidden = false;
  registerMessage.textContent = '';
  window.dispatchEvent(new CustomEvent('xxmarco:verification-request', { detail: { email: verificationEmail } }));
  document.querySelector('#verification-code').focus();
});

verificationForm.addEventListener('submit', event => {
  event.preventDefault();
  const code = String(new FormData(verificationForm).get('code') || '').trim();
  window.dispatchEvent(new CustomEvent('xxmarco:verification-submit', { detail: { email: verificationEmail, code } }));
  verificationMessage.textContent = 'Aguardando confirmação do código.';
});

let successToastTimer;
function showRegistrationSuccess() {
  selectAuthTab('login');
  registrationSuccess.hidden = false;
  window.clearTimeout(successToastTimer);
  successToastTimer = window.setTimeout(() => { registrationSuccess.hidden = true; }, 3200);
}
window.showXXMarcoRegistrationSuccess = showRegistrationSuccess;
window.addEventListener('xxmarco:verification-success', showRegistrationSuccess);

document.querySelector('#resend-code').addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('xxmarco:verification-request', { detail: { email: verificationEmail } }));
  verificationMessage.textContent = 'A solicitação de novo código está preparada.';
});

const loginBackgrounds = [
  'assets/images/conquista.jpeg', 'assets/images/bandeira.jpeg', 'assets/images/time-feminino.jpeg',
  'assets/images/time-basquete.jpeg', 'assets/images/equipe-quadra-completa.jpeg', 'assets/images/equipe-feminina-volei.jpeg'
];
const photoLayers = [...document.querySelectorAll('.auth-photo-layer')];
let photoIndex = 0;
let activeLayerIndex = 0;
photoLayers[0].style.backgroundImage = `url("${loginBackgrounds[photoIndex]}")`;

window.setInterval(() => {
  photoIndex = (photoIndex + 1) % loginBackgrounds.length;
  const nextLayerIndex = 1 - activeLayerIndex;
  const nextLayer = photoLayers[nextLayerIndex];
  const preload = new Image();
  preload.onload = () => {
    nextLayer.style.backgroundImage = `url("${loginBackgrounds[photoIndex]}")`;
    nextLayer.classList.add('is-active');
    photoLayers[activeLayerIndex].classList.remove('is-active');
    activeLayerIndex = nextLayerIndex;
  };
  preload.src = loginBackgrounds[photoIndex];
}, 10000);
