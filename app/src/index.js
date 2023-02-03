import Web3 from 'web3';
import starNotaryArtifact from '../../build/contracts/StarNotary.json';

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error('Could not connect to contract or chain.');
    }
  },

  setStatus: function (message) {
    this.statusTextEl.innerHTML = message;
    this.statusEl.classList.remove('d-none');
  },

  clearStatus: function () {
    this.statusEl.classList.add('d-none');
    this.statusTextEl.innerHTML = '';
  },

  createStar: async function () {
    this.clearStatus();

    const { createStar, getCurrentTokenId } = this.meta.methods;
    const nameInput = document.getElementById('starName');

    const tokenId = await getCurrentTokenId().call();

    const submitButton = this.createStarForm.querySelector('[type="submit"]');
    submitButton.setAttribute('disabled', true);
    const defaultLabel = submitButton.innerHTML;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

    await createStar(nameInput.value).send({ from: this.account });

    submitButton.removeAttribute('disabled');
    submitButton.innerHTML = defaultLabel;

    this.setStatus(
      `A new star has been created! Owner: ${this.account}, token ID: ${tokenId}`
    );

    nameInput.value = '';
  },

  lookForStar: async function () {
    this.clearStatus();

    const { lookUpTokenIdToStarInfo } = this.meta.methods;

    const tokenIdEl = document.getElementById('tokenId');

    const submitButton = this.lookForStarForm.querySelector('[type="submit"]');
    submitButton.setAttribute('disabled', true);
    const defaultLabel = submitButton.innerHTML;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

    const starName = await lookUpTokenIdToStarInfo(tokenIdEl.value).call();

    submitButton.removeAttribute('disabled');
    submitButton.innerHTML = defaultLabel;

    this.setStatus(`The star name: ${starName}`);

    tokenIdEl.value = '';
  },

  registerEvents: function () {
    this.createStarForm.addEventListener('submit', (event) => {
      event.preventDefault();

      this.createStar();
    });

    this.lookForStarForm.addEventListener('submit', (event) => {
      event.preventDefault();

      this.lookForStar();
    });
  },

  init: function () {
    this.statusEl = document.getElementById('status');
    this.statusTextEl = document.getElementById('status-text');

    this.createStarForm = document.getElementById('createStarForm');
    this.lookForStarForm = document.getElementById('lookForStarForm');

    this.registerEvents();
  },
};

window.App = App;

window.addEventListener('load', async function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);

    await window.ethereum.enable(); // get permission to access accounts

    App.init();
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live'
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider('http://127.0.0.1:9545')
    );
  }

  App.start();
});
