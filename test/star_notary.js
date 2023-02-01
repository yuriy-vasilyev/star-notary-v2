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
  it('can create a star', async () => {
    const instance = await StarNotary.deployed();

    const ownerAddress = accounts[0];

    const tokenId = await instance.getCurrentTokenId.call();

    await instance.createStar(STAR_NAME, {
      from: ownerAddress,
    });

    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), STAR_NAME);
  });

  it('can put up star for sale', async () => {
    const instance = await StarNotary.deployed();
    const ownerAddress = accounts[0];

    const tokenId = await instance.getCurrentTokenId.call();

    await instance.createStar(STAR_NAME, {
      from: ownerAddress,
    });

    await instance.putStarUpForSale(tokenId, STAR_PRICE, {
      from: ownerAddress,
    });

    assert.equal(await instance.starsForSale.call(tokenId), STAR_PRICE);
  });

  it('can buy a star', async () => {
    const instance = await StarNotary.deployed();

    const ownerAddress = accounts[1];
    const buyerAddress = accounts[2];

    const tokenId = await instance.getCurrentTokenId.call();

    await instance.createStar(STAR_NAME, {
      from: ownerAddress,
    });

    await instance.putStarUpForSale(tokenId, STAR_PRICE, {
      from: ownerAddress,
    });

    await instance.buyStar(tokenId, {
      from: buyerAddress,
      value: BALANCE,
    });

    assert.equal(await instance.ownerOf.call(tokenId), buyerAddress);
  });

  it('owner balance increases after deal', async () => {
    const instance = await StarNotary.deployed();

    const ownerAddress = accounts[1];
    const buyerAddress = accounts[2];

    const tokenId = await instance.getCurrentTokenId.call();

    await instance.createStar(STAR_NAME, {
      from: ownerAddress,
    });

    await instance.putStarUpForSale(tokenId, STAR_PRICE, {
      from: ownerAddress,
    });

    const ownerBalanceBefore = await web3.eth.getBalance(ownerAddress);

    await instance.buyStar(tokenId, {
      from: buyerAddress,
      value: BALANCE,
      gasPrice: web3.eth.baseFeePerGas,
    });

    const ownerBalanceAfter = await web3.eth.getBalance(ownerAddress);

    const value =
      Number(ownerBalanceAfter) -
      Number(ownerBalanceBefore);

    assert.equal(value, Number(STAR_PRICE));
  });
});
