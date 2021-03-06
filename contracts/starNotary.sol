pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }
    //  Add a name and a symbol for your starNotary tokens
    string public name = "StarNotary Token";
    string public symbol = "SNT";

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    // Get token metadata
    function name() external view returns (string) {
        return name;
    }

    function symbol() external view returns (string) {
        return symbol;
    }

    // Add a function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, and then returns the name of the star.
    function lookUptokenIdToStarInfo(uint256 _tokenId) external view returns (string) {
        return tokenIdToStarInfo[_tokenId].name;
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "Only token owner can sell this token");

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
        starsForSale[_tokenId] = 0;
    }

    // Write a function to Transfer a Star. The function should transfer a star from the address of the caller.
    // The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star.

    // TODO: Need to be tested
    function transferOwnership(address newOwner, uint256 _tokenId) public {
        
        require(ownerOf(_tokenId) == msg.sender, "Only token owner can tranfer this token");
        require(msg.sender != newOwner, "New owner can't be existing one");

        safeTransferFrom(msg.sender, newOwner, _tokenId);
    }

    // Add a function called exchangeStars, so 2 users can exchange their star tokens...
    //Do not worry about the price, just write code to exchange stars between users.
    function exchangeStars(uint256 ownedToken, uint256 desiredToken) public {
        address desiredTokenOwner = ownerOf(desiredToken);

        require(ownerOf(ownedToken) == msg.sender, "Only token owner can sell this token");
        require(starsForSale[desiredToken] > 0, "Token should be listed on sales list");
        
        // Send user1 token to user2
        _removeTokenFrom(msg.sender, ownedToken);
        _addTokenTo(desiredTokenOwner, ownedToken);

        // Send user2 token to user1
        _removeTokenFrom(desiredTokenOwner, desiredToken);
        _addTokenTo(msg.sender, desiredToken);
    }
}
