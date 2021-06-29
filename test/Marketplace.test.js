//const _deploy_contracts = require("../migrations/2_deploy_contracts")

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

                })
    })
})