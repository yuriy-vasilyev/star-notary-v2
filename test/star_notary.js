const StarNotary = artifacts.require('StarNotary');

const STAR_NAME = 'Awesome Star!';
const STAR_PRICE = web3.utils.toWei('.01', 'ether');
const BALANCE = web3.utils.toWei('.05', 'ether');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('StarNotary', (accounts) => {
  it('user can create a star', async () => {
    const instance = await StarNotary.deployed();

    const ownerAddress = accounts[0];

    const tokenId = await instance.createStar.call(STAR_NAME, {
      from: ownerAddress,
    });

    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), STAR_NAME);
  });

  it('lets owner put up star for sale', async () => {
    const instance = await StarNotary.deployed();
    const ownerAddress = accounts[0];

    const tokenId = await instance.createStar.call(STAR_NAME, {
      from: ownerAddress,
    });

    await instance.putStarUpForSale.call(tokenId, STAR_PRICE, {
      from: ownerAddress,
    });

    assert.equal(await instance.starsForSale.call(tokenId), STAR_PRICE);
  });

  it('lets owner get the funds after the sale', async () => {
    const instance = await StarNotary.deployed();

    const ownerAddress = accounts[1];
    const buyerAddress = accounts[2];

    const tokenId = await instance.createStar.call(STAR_NAME, {
      from: ownerAddress,
    });

    await instance.putStarUpForSale.call(tokenId, STAR_PRICE, {
      from: ownerAddress,
    });

    await instance.buyStar.call(tokenId, {
      from: buyerAddress,
      value: BALANCE,
    });

    assert.equal(await instance.ownerOf.call(tokenId), buyerAddress);
  });

  it('lets user buy a star and decreases its balance in ether', async () => {
    const instance = await StarNotary.deployed();

    const ownerAddress = accounts[1];
    const buyerAddress = accounts[2];

    const tokenId = await instance.createStar.call(STAR_NAME, {
      from: ownerAddress,
    });

    await instance.putStarUpForSale.call(tokenId, STAR_PRICE, {
      from: ownerAddress,
    });

    const buyerBalanceBefore = await web3.eth.getBalance(buyerAddress);

    await instance.buyStar.call(tokenId, {
      from: buyerAddress,
      value: BALANCE,
      gasPrice: 0,
    });

    const buyerBalanceAfter = await web3.eth.getBalance(buyerAddress);

    const value = Number(buyerBalanceBefore) - Number(buyerBalanceAfter);

    assert.equal(value, STAR_PRICE);
  });
});
