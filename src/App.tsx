import React, { useState } from "react";
import { useMutation, useQuery } from "/convex/_generated/react";
import { Voter } from "./voter-type";

const tableColumns = ['First', 'Last', 'Street', 'City']
const EMPTY_ARRAY = [];

export default function App() {
  const [firstNameQuery, setFirstNameQuery] = useState("");
  const [lastNameQuery, setLastNameQuery] = useState("");
  const [email, setEmail] = useState("");
  const [tempVoters, setTempVoters] = useState({});
  const votersByFirst: Voter[] = useQuery("queryVoters", { firstNameQuery, lastNameQuery }) || EMPTY_ARRAY;

  const saveSelections = useMutation('saveVotersForEmail')

  const addToTempVoterList = (voter: Voter) => {
    const voterId = voter.state_file_id;
    setTempVoters(() => {
      const {First, Last, Street, state_file_id} = voter;
      return {...tempVoters, [voterId]: {First, Last, Street, state_file_id}};
    })
  }

  const removeFromTempVoterList = (voter: Voter) => {
    const voterId = voter.state_file_id;
    setTempVoters(() => {
      delete tempVoters[voterId];
      return {...tempVoters}
    })
  }

  const savedVoters: Voter[] = Object.values(tempVoters);

  const renderSavedList = () => {
    return (savedVoters[0] &&
      <><h3>Step 3: Submit your saved voter list</h3><table className="Results" data-js="saved-results">
          <thead className="Results-header">
            <tr>
              <th className="Results-header_cell"></th>{tableColumns.map((column) => <th className="Results-header_cell">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {savedVoters.map((voter: Voter) => (
              <tr className="Results-row" key={voter.state_file_id.toString()}>
                <td className="Results-row_cell">
                  <button type="button" onClick={() => removeFromTempVoterList(voter)}>Remove from list</button>
                </td>
                {tableColumns.map((column) => <td className="Results-row_cell">{voter[column]}</td>)}
              </tr> 
            ))}
          </tbody>
        </table>
        <button className="Button" onClick={() => saveSelections({email, savedVoters})}>Submit (Click when Finished)</button>
        </>)
  }

  const renderSearchList = () => {
    return (votersByFirst[0] && <table className="Results" data-js="name-results">
    <thead className="Results-header">
      <tr>
        <th className="Results-header_cell"></th>{tableColumns.map((column) => <th className="Results-header_cell">{column}</th>)}
      </tr>
    </thead>
    <tbody>
      {votersByFirst.map((voter: Voter) => (
        <tr className="Results-row" key={voter.state_file_id.toString()}>
          <td className="Results-row_cell">
            <button type="button" onClick={() => addToTempVoterList(voter)}>Add to my list</button>
          </td>
          {tableColumns.map((column) => <td className="Results-row_cell">{voter[column]}</td>)}
        </tr> 
      ))}
    </tbody>
  </table>)
  }

  return (
    <main>
      <div className="titlebar">
        <h1>Make your own mailer!</h1>
      </div>
      <header>
        <h2 className="Title">Find your friends</h2>
        <p>You are now going to make a list of everyone who you'd like to send a personal mailer to about the election! <strong>Casual acquaintances are ok - remember, the vast majority of people have no information about most races this year!</strong></p>
      </header>
      <div className="Wrapper">
      <div className="SearchWrapper">
        <h3 className="label">Step 1: Enter your email</h3>
        <label htmlFor="email">Email address</label>
        <input className="Input" id="email" name="email" placeholder="Your email" onChange={event => setEmail(event.target.value)}/>
      </div>
      <div className="SearchWrapper">
        <h3 className="label">Step 2: Search by Name</h3>
        <label htmlFor="first-name">First name</label>
        <input
          className="Input"
          name="first-name"
          placeholder="Enter at least three letters"
          value={firstNameQuery}
          onChange={event => setFirstNameQuery(event.target.value)}
        />
        <label htmlFor="last-name">Last name</label>
        <input
          className="Input"
          name="last-name"
          placeholder="Enter at least three letters"
          value={lastNameQuery}
          onChange={event => setLastNameQuery(event.target.value)}
        />
        {renderSearchList()}
      </div>
      <div className="SavedWrapper SearchWrapper">
        {renderSavedList()}
      </div>
    </div>
      
    </main>
  );
}