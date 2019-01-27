//import 'babel-polyfill';
const StarNotary = artifacts.require('./starNotary.sol')

let instance;
let accounts;

contract('StarNotary', async (accs) => {
    accounts = accs;
    instance = await StarNotary.deployed();
  });

  it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo(tokenId), 'Awesome Star!')
  });

  it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1]
    let starId = 2;
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    assert.equal(await instance.starsForSale.call(starId), starPrice)
  });

  it('lets user1 get the funds after the sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 3
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
    await instance.buyStar(starId, {from: user2, value: starPrice})
    let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)
    assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), balanceOfUser1AfterTransaction.toNumber());
  });

  it('lets user2 buy a star, if it is put up for sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 4
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice});
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  it('lets user2 buy a star and decreases its balance in ether', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 5
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice:0})
    const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)
    assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice);
  });

  // Write Tests for:

// 1) The token name and token symbol are added properly.
  it('The token name and token symbol are added properly', async () => {
    assert.equal(await instance.name(), 'StarNotary Token');
    assert.equal(await instance.symbol(), 'SNT');
  });

// 2) 2 users can exchange their stars.

  // 3) Stars Tokens can be transferred from one address to another.
  it('Transfer token from first address to second', async () => {
    const [user1, user2] = accounts;
    const starId = 6;

    // Create a star
    await instance.createStar('awesome star', starId, {from: user1})
    
    assert.equal(await instance.ownerOf(starId), user1);

    // Transfer star from user1 to user2
    await instance.transferOwnership(user2, starId, { from: user1 });
    
    // // Check if user2 owns transfered star
    assert.equal(await instance.ownerOf(starId), user2);
  });


  // 4) Users can exchange tokens (price doesn't matter)
  it('Transfer token from first address to second', async () => {
    const [user1, user2] = accounts;
    const [firstStarId, secondStarId] = [7, 8];
    const starPrice = web3.toWei(.01, "ether")

    // User1 creates a star
    await instance.createStar('Alpha', firstStarId, { from: user1 });
    
    // User2 creates a star
    await instance.createStar('Omega', secondStarId, { from: user2 });

    // User1 puts his star on sale
    await instance.putStarUpForSale(firstStarId, starPrice, {from: user1});

    // User2 wants to exchange his star to User1's star
    await instance.exchangeStars(secondStarId, firstStarId, {from: user2});

    // Check if exchange happened
    assert.equal(await instance.ownerOf(secondStarId), user1);
    assert.equal(await instance.ownerOf(firstStarId), user2);
  });