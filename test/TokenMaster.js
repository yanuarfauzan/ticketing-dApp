const { expect } = require("chai")

const tokens = (n)=> {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe("TokenMaster", () => {
    let deployer, eventOrganizer, user, tokenMaster, transaction;
    const NAME = "TokenMaster";
    const SYMBOL = "TM";
    const EVENT = "Taylor Swift Concert";
    const COST = tokens(1);
    const TICKETS = 100;
    const MAX_TICKETS = 100;
    const DATE = "2021-01-01";
    const TIME = "20:00";
    const LOCATION = "New York";
    describe("Deployment", () => {
        beforeEach(async () => {
            [deployer, eventOrganizer, user] = await ethers.getSigners();
            const TokenMaster = await ethers.getContractFactory("TokenMaster");
            tokenMaster = await TokenMaster.connect(deployer).deploy(NAME, SYMBOL, eventOrganizer.address);
        
            transaction = await tokenMaster.connect(eventOrganizer).createEvent(EVENT, COST, TICKETS, MAX_TICKETS, DATE, TIME, LOCATION
            )
            await transaction.wait();
        })

        it('sets the name', async () => {
            const name = await tokenMaster.name();
            expect(name).to.be.equal(NAME);
        })

        it('sets the symbol', async () => {
            const symbol = await tokenMaster.symbol();
            expect(symbol).to.be.equal(SYMBOL);
        })

        it('sets the owner', async () => {
            const owner = await tokenMaster.owner();
            expect(owner).to.be.equal(deployer.address);
        })
    })

    describe('Create Events', async () => {
        beforeEach(async () => {
            [deployer, eventOrganizer, user] = await ethers.getSigners();
            const TokenMaster = await ethers.getContractFactory("TokenMaster");
            tokenMaster = await TokenMaster.connect(deployer).deploy(NAME, SYMBOL, eventOrganizer.address);
        
            transaction = await tokenMaster.connect(eventOrganizer).createEvent(EVENT, COST, TICKETS, MAX_TICKETS, DATE, TIME, LOCATION
            )
            await transaction.wait();
        })

        it('Update total events', async () => {
            const totalEvents = await tokenMaster.totalEvents();
            expect(totalEvents).to.be.equal(1);
        })

        it('Sets the attributes', async () => {
            const event = await tokenMaster.getEvents(1);
            expect(event.id).to.be.equal(1);
            expect(event.name).to.be.equal(EVENT);
            expect(event.cost).to.be.equal(COST);
            expect(event.tickets).to.be.equal(TICKETS);
            expect(event.maxTickets).to.be.equal(MAX_TICKETS);
            expect(event.date).to.be.equal(DATE);
            expect(event.time).to.be.equal(TIME);
            expect(event.location).to.be.equal(LOCATION);
        })
    })

    describe('Minting', async () => {
        const ID = 1;
        const SEAT = 50;
        const AMOUNT = tokens(1);

        beforeEach(async () => {
            [deployer, eventOrganizer, user] = await ethers.getSigners();
            const TokenMaster = await ethers.getContractFactory("TokenMaster");
            tokenMaster = await TokenMaster.connect(deployer).deploy(NAME, SYMBOL, eventOrganizer.address);
        
            transaction = await tokenMaster.connect(eventOrganizer).createEvent(EVENT, COST, TICKETS, MAX_TICKETS, DATE, TIME, LOCATION
            )
            await transaction.wait();

            transaction = await tokenMaster.connect(user).mint(ID, SEAT, {value: AMOUNT});
            await transaction.wait();
        })

        it('Updates ticket counts', async () => {
            const totalEvents = await tokenMaster.getEvents(1);
            expect(totalEvents.tickets).to.be.equal(TICKETS - 1);
        })

        it('Updates buying status', async () => {
            const hasBought = await tokenMaster.hasBought(ID, user.address);
            expect(hasBought).to.be.equal(true);
        })

        it('Updates seatTaken status', async () => {
            const owner = await tokenMaster.seatTaken(ID, SEAT);
            expect(owner).to.be.equal(user.address);
        })

        it('Updates overall seatTaken', async () => {
            const seats = await tokenMaster.getSeatTakens(ID);
            expect(seats.length).to.equal(1);
            expect(seats[0]).to.be.equal(SEAT);
        })

        it('Updates contract balance', async () => {
            const balance = await ethers.provider.getBalance(tokenMaster.address);
            expect(balance).to.be.equal(AMOUNT);
        })



    })
})
