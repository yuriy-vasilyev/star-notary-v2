// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StarNotary is ERC721 {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  struct Star {
    string name;
  }

  mapping(uint256 => Star) public tokenIdToStarInfo;

  mapping(uint256 => uint256) public starsForSale; // tokenId => price

  constructor() ERC721("StarNotary", "SNT") {}

  function getCurrentTokenId() public view returns (uint256) {
    return _tokenIds.current();
  }

  function lookUpTokenIdToStarInfo(
    uint256 _tokenId
  ) public view returns (string memory) {
    return tokenIdToStarInfo[_tokenId].name;
  }

  function createStar(string memory _name) public returns (uint256) {
    Star memory newStar = Star(_name);

    uint256 newItemId = _tokenIds.current();

    _safeMint(msg.sender, newItemId);

    tokenIdToStarInfo[newItemId] = newStar;

    _tokenIds.increment();

    return newItemId;
  }

  function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
    require(ownerOf(_tokenId) == msg.sender, "You're not owner");

    starsForSale[_tokenId] = _price;
  }

  function buyStar(uint256 _tokenId) public payable {
    require(starsForSale[_tokenId] > 0, "The Star should be up for sale");

    uint256 starCost = starsForSale[_tokenId];

    address ownerAddress = ownerOf(_tokenId);

    require(msg.value > starCost, "You need to have enough Ether");

    _transfer(ownerAddress, msg.sender, _tokenId);

    payable(ownerAddress).transfer(starCost);

    if (msg.value > starCost) {
      payable(msg.sender).transfer(msg.value - starCost);
    }
  }

  function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public payable {
    address tokenId1Owner = ownerOf(_tokenId1);
    address tokenId2Owner = ownerOf(_tokenId2);

    require(
      msg.sender == tokenId1Owner || msg.sender == tokenId2Owner,
      "You must owe one of the stars."
    );

    _transfer(tokenId1Owner, tokenId2Owner, _tokenId1);
    _transfer(tokenId2Owner, tokenId1Owner, _tokenId2);
  }

  function transferStar(address to, uint256 _tokenId) public payable {
    address ownerAddress = ownerOf(_tokenId);

    require(msg.sender == ownerAddress, "You are not a star owner");

    _transfer(msg.sender, to, _tokenId);
  }
}
