// SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.1;
pragma experimental ABIEncoderV2;

/// @title Message Time Store
/// @author James D Hackman: preciouschicken.com
/// @notice Stores a string from address, releases string after specified time
contract TimeStore  {

    struct StoredData {
        uint id;
        string storedMsg;
        uint unlockTime;
    }
    StoredData[] private userStoredData;
    mapping(address => StoredData[]) private store;
    

    /// @notice Stores incoming messages from address 
    /** @dev nextId starts at 1, so zeros can be removed by client.
      Neccessary as memory array in getMsgTimed can return empty arrays.
      */
    /// @param _storedMsg string to be stored
    /// @param _unlockTime unix time for _storedMsg to be stored until
    function storeMsg(string memory _storedMsg, uint _unlockTime) public {
        StoredData[] memory currentData = store[msg.sender];
        uint nextId = currentData.length + 1;
        StoredData memory newData = StoredData(nextId, _storedMsg, _unlockTime);
        userStoredData.push(newData);
        store[msg.sender] = userStoredData;
    }

    /// @notice Returns unlocked messages, as array of objects
    /// @dev For any message not unlocked returns an object with blank values
    /// @return StoredData[] array of StoredData struct 
    function getMsgTimed() public view returns (StoredData[] memory) {
        StoredData[] memory currentData = store[msg.sender];
        StoredData[] memory unlockedData = new StoredData[](currentData.length);
        uint unlockedDataIndex = 0;
        for (uint i = 0; i < currentData.length; i++) {
            if (currentData[i].unlockTime <= now) {
                StoredData memory newData = StoredData(
                    currentData[i].id, 
                    currentData[i].storedMsg, 
                    currentData[i].unlockTime);
                unlockedData[unlockedDataIndex] = newData;
                unlockedDataIndex++;
            }
        }
        return unlockedData;
    }

}

