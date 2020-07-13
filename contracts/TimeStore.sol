// SPDX-License-Identifier: The Unlicencse
pragma solidity ^0.6.1;
pragma experimental ABIEncoderV2;

contract TimeStore  {

    struct StoredData {
        uint id;
        string storedMsg;
        uint unlockTime;
    }
    StoredData[] public userStoredData;
    string[] public arrString;
    mapping(address => StoredData[]) public store;
    string private msgData;
        
    // Finds length of current array, so to generate next ID number
    // Next ID starts at 1, so IDs of zero can be removed
    // Necessary as memory array in getMsgTimed returns empty arrays
    // Add user data to temp struct, pushes temp struct to array
    // Maps array to msg.sender
    function storeMsg(string memory _storedMsg, uint _unlockTime) public {
        StoredData[] memory currentData = store[msg.sender];
        uint nextId = currentData.length + 1;
        StoredData memory newData = StoredData(nextId, _storedMsg, _unlockTime);
        userStoredData.push(newData);
        store[msg.sender] = userStoredData;
    }

    // Returns all msg for msg.sender, regardless of time
    function getMsgNow() public view returns (StoredData[] memory) {
        StoredData[] memory tempData = store[msg.sender];
        return tempData;
    }


    function getMsgTimed() public view returns (StoredData[] memory) {
        StoredData[] memory currentData = store[msg.sender];
        StoredData[] memory unlockedData = new StoredData[](currentData.length);
        uint unlockedDataIndex = 0;
        for (uint i = 0; i < currentData.length; i++) {
            if (currentData[i].unlockTime <= now) {
                StoredData memory newData = StoredData(currentData[i].id, currentData[i].storedMsg, currentData[i].unlockTime);
                unlockedData[unlockedDataIndex] = newData;
                unlockedDataIndex++;
            }
        }
        return unlockedData;

        //TODO: unlockedData full of zeros, shall I filter in React or in solidity?
    }
    
}

// TimeStore.deployed().then(function(instance) {app = instance})
// app.storeMsg("Hello", 1)
// app.retrieveMsgNow()
