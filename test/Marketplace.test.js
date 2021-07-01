//const _deploy_contracts = require("../migrations/2_deploy_contracts")

const { assert } = require('chai')

const Marketplace = artifacts.require('./Marketplace.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

// All test functions go in here
contract('Marketplace', ([deployer, seller, buyer]) => {
   let marketplace

   before(async () => {
       marketplace = await Marketplace.deployed()
   })

    describe('deployment', async() => {
        it('deploys successfully', async () => {
            const address = await marketplace.address
            const nm = await marketplace.name()
            assert.notEqual(address, 0x0) // make sure address is not zero
            assert.notEqual(address, '') // make sure address is not an empty string
            assert.notEqual(address, null) // make sure address is not null
            assert.notEqual(address, undefined) // make sure address is not undefined
            assert.equal(nm,"Jolly Finder Marketplace" )
        })

        it('Has a name', async () => {
            const nm = await marketplace.name()
            assert.equal(nm,"Jolly Finder Marketplace" ) // make sure name of contract is correct
        })
    })

    describe('products', async() => {
        let result, productCount

        before(async () => {
            result = await marketplace.createProduct('iPhone X', web3.utils.toWei('1', 'Ether'), {from: seller})
            productCount = await marketplace.productCount()
        })

        it('creates products', async () => {
            // Success Case       
            assert.equal(productCount,1 )
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(),productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'iPhone X','name is correct' )
            assert.equal(event.price,'1000000000000000000','price is correct' )
            assert.equal(event.owner, seller ,'owner is correct' )
            assert.equal(event.purchased,false ,'purchased is correct' )

            // Failure Case     
            await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), {from: seller}).should.be.rejected; // Product must have a name

            await marketplace.createProduct('iPhone X',0 , {from: seller}).should.be.rejected; // Product must have a price
        })

        // test to see you can access the products
        it('Lists products', async () => {

            const product = await marketplace.products(productCount)
            assert.equal(product.id.toNumber(),productCount.toNumber(), 'id is correct')
            assert.equal(product.name, 'iPhone X','name is correct' )
            assert.equal(product.price,'1000000000000000000','price is correct' )
            assert.equal(product.owner, seller ,'owner is correct' )
            assert.equal(product.purchased,false ,'purchased is correct' )
        })

        // test to see you can sell products
        it('Sells products', async () => {
            // track the seller balance before purchase
            let oldSellerBalance
            oldSellerBalance = await web3.eth.getBalance(seller)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)   //BN is a variable type called Big Number
    
            //Success Tests
            //Buyer makes a purchase
            result = await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('1', 'Ether')}) 
            
            // check logs
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(),productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'iPhone X','name is correct' )
            assert.equal(event.price,'1000000000000000000','price is correct' )
            assert.equal(event.owner, buyer ,'owner is correct' )
            assert.equal(event.purchased,true ,'purchased is correct' )

            // Check that seller received funds
            let newSellerBalance
            newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance)  

            let price
            price = web3.utils.toWei('1','Ether')
            price = new web3.utils.BN(price)

            const expectedBalance = oldSellerBalance.add(price)

            assert.equal(newSellerBalance.toString(), expectedBalance.toString())


            //Failure Tests
            // Tries to buy a product that does not exists (Basically trying to buy an invalid ID, product must have valid ID)
            await marketplace.purchaseProduct(99, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

            // Buyer tries to buy without enough ether
            await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;

            // Deployer tries to buy the product. i.e. product can't be purchased twice
            await marketplace.purchaseProduct(productCount, {from: deployer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

            // Buyer tries to buy again, i.e. buyer can't be the seller
            await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        })
    })
})