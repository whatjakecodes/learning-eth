// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(address(newCampaign));
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {

    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        mapping(address => bool) approvals;
        uint approvalCount;
    }
    Request[] public requests;

    address public manager;
    uint public approversCount;
    mapping(address => bool) public approvers;
    uint public minimumContribution;

    constructor(uint minimum, address creator) {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution, "must contribute more");
        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(string memory description, uint value, address payable recipient) public isManager {
        Request storage newRequest = requests.push();
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    function approveRequest(uint index) public isApprover {
        require(index < requests.length, "request must exist");
        Request storage request = requests[index];
        require(!request.complete, "request already completed");
        require(!request.approvals[msg.sender], "already voted");

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public  isManager {
        require(index < requests.length, "request must exist");
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount/2), "not enough votes");

        require(!request.complete, "request already completed");

        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function approvalPercentage(uint index) public view returns (uint){
        require(approversCount > 0, "no approvers yet");
        require(index < requests.length, "request must exist");
        Request storage request = requests[index];

        return 100 * request.approvalCount / approversCount;
    }

    modifier isManager() {
        require(msg.sender == manager, "must be manager");
        _;
    }

    modifier isApprover() {
        require(approvers[msg.sender], "must be approver");
        _;
    }
}
