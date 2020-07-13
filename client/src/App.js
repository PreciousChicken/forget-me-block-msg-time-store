import React, { useState, useEffect } from 'react';
import DateFnsUtils from "@date-io/date-fns";
import { Button, TextField } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers';
import moment from 'moment';
import './App.css';
import { ethers } from "ethers";
import TimeStore from "./contracts/TimeStore.json";

const contractAddress ='0x2c93564045502dBC5e90009e8408C0B7b888523e';

let provider;
let signer;
let timeStoreContract;
let noProviderAbort = false;

// Ensures metamask or similar installed
async function enableEth() {
	if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
		try{
			await window.ethereum.enable()
			provider = new ethers.providers.Web3Provider(window.ethereum);
			signer = provider.getSigner();
			timeStoreContract = new ethers.Contract(contractAddress, TimeStore.abi, signer);
			noProviderAbort = false;
		} catch(e) {
			noProviderAbort = true;
		}
	}
}

enableEth();


function App() {
	const refreshMinutes = 5; // Changes minutes checks blockchain
	const [storedData, setStoredData] = useState([]);
	const [selectedDate, handleDateChange] = useState(new Date());
	const [refreshTime, setRefreshTime] = useState(moment().add(refreshMinutes, 'minutes').format("HH:mm"));

	// Refreshes page, calls check for new unlocked data on blockchain
	useEffect(() => {
		const interval = setInterval(() => {
			getStoredMsg();
			setRefreshTime(moment().add(refreshMinutes, 'minutes').format("HH:mm"));
		}, (refreshMinutes * 60000));
		return () => clearInterval(interval);
	}, []);

	// Aborts app if metamask etc not present
	if (noProviderAbort) {
		return (
			<div>
			<h1>Error</h1>
			<p><a href="https://metamask.io">Metamask</a> or equivalent required to access this page.</p>
			</div>
		);
	}

	// Checks for new unlocked data on blockchain
	function getStoredMsg() {
		timeStoreContract.getMsgTimed().then(msg => {setStoredData(msg)}); 
	}


	// Handles user store message form submit
	const handleStoreMsg = (e: React.FormEvent) => {
		let unixTimeStamp = moment(selectedDate).unix();
		timeStoreContract.storeMsg(e.target.msgToStore.value, unixTimeStamp);
		e.preventDefault();
	};


	// Handles user get message now form submit
	const handleGetMsg = (e: React.FormEvent) => {
		getStoredMsg();
		e.preventDefault();
	};


	return (
		<main>
		<h1>Forget-me-Block: Message Time Store</h1> 

		<p>A research project deliverable examining the use of the Ethereum blockchain for data preservation: <a href="https://www.preciouschicken.com/blog/posts/forget-me-block-msg-time-store/">further information</a> or <a href="https://github.com/PreciousChicken/forget-me-block-msg-time-store">fork me on Github</a>.</p>

		<div className="form-group">
		<h2>Store Message</h2>
		<form onSubmit={handleStoreMsg}>

		<div className="block-element">
	<MuiPickersUtilsProvider utils={DateFnsUtils}>	
		<KeyboardDateTimePicker 
		format="yyyy-MM-dd HH:mm"
		ampm="false"
		label="Date to store until:"
		inputVariant="outlined"
		value={selectedDate} onChange={handleDateChange} />
		</MuiPickersUtilsProvider>
		</div>
		<div className="block-element">
		<TextField 
		name="msgToStore" id="outlined-basic" label="Message to store:" variant="outlined" />
		</div>
		<div className="block-element">
		<Button variant="contained" color="primary" type="submit">
		Submit
		</Button>
		</div>
		</form>
		</div>
		<div className="form-group">
		<h2>Retrieve Stored Messages</h2>
		<p>The blockchain will be checked at {refreshTime} for new unlocked data. Alternatively:</p>
		<form onSubmit={handleGetMsg}>
		<div className="block-element">
		<Button variant="contained" color="primary" type="submit">
		Get Data Now
		</Button>
		</div>
		</form>
		<div className="block-element">
		{(storedData.length > 0) &&
			<table>
			<thead>
			<tr>
			<th>Date/Time</th>
			<th>Message</th>
			</tr>
			</thead>
			<tbody>
			{storedData.map(msg => {
				if(msg.id.toNumber() > 0) {
					return (
				<tr key={msg.id.toNumber()}>
				<td>{moment.unix(msg.unlockTime.toNumber()).format("DD MMM YY, HH:mm")}</td>
				<td>{msg.storedMsg}</td>
				</tr>
					)
				}
				return null;
			}
			)}
			</tbody>
			</table>
		}
		</div>
		</div>
		</main>
	);
}

export default App;

