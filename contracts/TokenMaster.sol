// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract TokenMaster is ERC721 {
    address public owner;
    address public eventOrganizer;
    uint256 public totalSupply;

    uint256 public totalEvents;

    constructor(string memory _name, string memory _symbol, address _eventOrganizer) ERC721(_name, _symbol){
        owner = msg.sender;
        eventOrganizer = _eventOrganizer;
    }

    struct Event{
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    event EventCreated(uint256 _id, string _name, uint256 _cost, uint256 _tickets, uint256 _maxTickets, string _date, string _time, string _location);

    mapping(uint256 => Event) public events;

    mapping(uint256 => mapping(uint256 => address)) public seatTaken;

    mapping(uint256 => uint256[]) seatsTaken;

    mapping(uint256 => mapping(address => bool)) public hasBought;

    modifier onlyEo() {
        require(msg.sender == eventOrganizer, "Only event organizer can create events");
        _;
    }

    modifier idMustNotZero(uint256 _id) {
        require(_id != 0, "Id cannot be zero");
        _;
    }

    modifier idMustUnderTotalEvents(uint256 _id){
        require(_id <= totalEvents, "Id must under total events");
        _;
    }

    modifier valueMustGreaterThanCost(uint256 _id) {
        require(msg.value >= events[_id].cost, "Value must greater than cost");
        _;
    }

    modifier seatMustNotTaken(uint256 _id, uint256 _seat) {
        require(seatTaken[_id][_seat] == address(0), "Seat must not taken");
        require(_seat <= events[_id].maxTickets, "Seat must under max tickets");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function createEvent(string memory _name, uint256 _cost, uint256 _tickets, uint256 _maxTickets, string memory _date, string memory _time, string memory _location) public onlyEo {
        totalEvents++;
        Event memory ev = Event(
            totalEvents,
            _name,
            _cost,
            _tickets,
            _maxTickets,
            _date,
            _time,
            _location
        );

        events[totalEvents] = ev;

        emit EventCreated(totalEvents, _name, _cost, _tickets, _maxTickets, _date, _time, _location);
    }

    function getSeatTakens(uint256 _id) public view returns(uint256[] memory){
        return seatsTaken[_id];
    }

    function getEvents(uint256 _id) public view returns(Event memory){
        return events[_id];
    }

    function mint(uint256 _id, uint256 _seat) public payable 
    idMustNotZero(_id) 
    idMustUnderTotalEvents(_id) 
    valueMustGreaterThanCost(_id)
    seatMustNotTaken(_id, _seat) {
        events[_id].tickets -= 1;
        hasBought[_id][msg.sender] = true;
        seatTaken[_id][_seat] = msg.sender;
        seatsTaken[_id].push(_seat);
        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function withdraw() public onlyEo {
        (bool success, ) = eventOrganizer.call{value: address(this).balance}("");
        require(success);
    }


}
