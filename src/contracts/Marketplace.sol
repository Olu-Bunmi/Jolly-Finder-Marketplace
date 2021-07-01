pragma solidity ^0.5.0;

/*declare the main contract for the project which will handle the business logic for buying and selling items on the blockchain. 
It will read and write from the blockchain*/

contract Marketplace {
	/* check smart contract is deployed using a 
	variable called name which is a state variable. 
	It writes information to the bloack chain. */
	string public name;
	uint public productCount = 0;
	
	mapping(uint => Product) public products;  //mapping called "products" works like a  key and value pair. like <string, string> in c#. But here is a key and value of uint and Product class 

	struct Product{
		uint id;
		string name;
		uint price;
		address payable owner;
		bool purchased;
	}

		event ProductCreated(
		uint id,
		string name,
		uint price,
		address payable owner,
		bool purchased
	);

		event ProductPurchased(
		uint id,
		string name,
		uint price,
		address payable owner,
		bool purchased
	);


	// create the constructor
	constructor() public {
		name = "Jolly Finder Marketplace";
	}

	function createProduct(string memory _name, uint _price) public {    
		//require a valid name
		require(bytes(_name).length > 0); // validate is not a blank name

		//require a valid price
		require(_price > 0); // kind of validation to ensure price is greater than zero

		// Increment productCount
		productCount++;

		// Create the product
		products[productCount] = Product(productCount, _name, _price, msg.sender, false);

		// Trigger an event
		emit ProductCreated(productCount, _name, _price, msg.sender, false);
	}

	function purchaseProduct(uint _id) public payable{        // payable keyword is used by solidity to determine that this function can be allowed to send Ether
		// fetch the product
		Product memory _product = products[_id];  // instantiate a new product in memory(i.e creating copy of product already in the block chain linked with the product mapping)

		// fetch the owner
		address payable _seller = _product.owner;

		// Make sure the product is valid, i.e it has a valid ID
		require(_product.id > 0 && _product.id <= productCount);

		// Validate there is enough Ether for the transaction
		require(msg.value >= _product.price);

		// Validate that the product has not been previously purchased
		require(!_product.purchased);

		// Validate that the buyer is not the seller 
		require(_seller != msg.sender);

		// Transfer ownership to the buyer (msg.sender is the person who call this function)
		_product.owner = msg.sender;

		// Purchase It
		_product.purchased = true;

		// Update the product in mapping (with new values of product as implemented in this function)
		products[_id] = _product;

		// pay the seller by sending them Ether
		address(_seller).transfer(msg.value); 

		// Trigger an event
		emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);

	}
}

