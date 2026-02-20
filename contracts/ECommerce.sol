// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract ECommerce {

    address public owner;

    address payable public seller = payable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

    struct Item {
        uint256 id; 
        string name; 
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event List(string name, uint256 cost, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    constructor () {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function listItem(
        uint256 _id, 
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {

        Item memory item = Item(
            _id, _name, _category, _image, _cost, _rating, _stock
        );

        items[_id] = item;

        emit List(_name, _cost, _stock);
    }

    function purchaseItem(uint256 _id) public payable {

        Item memory item = items[_id];

        require(item.cost > 0, "Item does not exist");
        require(msg.value >= item.cost, "Insufficient ETH");
        require(item.stock > 0, "Out of stock");

        Order memory order = Order(block.timestamp, item);

        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;

        items[_id].stock = item.stock - 1;

        (bool success, ) = seller.call{value: item.cost}("");
        require(success, "Payment failed");

        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }
}