import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../App.css';

let number_fields = ["load_applied", "pincode"]

let column_names = ["ID", "Name", "Gender", "District", "State", "Pincode", "Ownership", "ID Type", "ID Number", "Category", "Load Applied", "Date Created", "Date Approved", "Date Modified", "Status", "Reviewer ID", "Reviewer Name", "Remarks"]
let key_names = {"ID": {key: "ID", editable: false, numeric: false},
                "Name": {key: "name", editable: true, numeric: false},
                "Gender": {key: "gender", editable: true, numeric: false},
                "District": {key: "district", editable: true, numeric: false},
                "State": {key: "state", editable: true, numeric: false},
                "Pincode": {key: "pincode", editable: true, numeric: true},
                "Ownership": {key: "ownership", editable: true, numeric: false},
                "ID Type": {key: "gov_id_type", editable: false, numeric: false},
                "ID Number": {key: "id_number", editable: false, numeric: false},
                "Category":  {key: "category", editable: true, numeric: false},
                "Load Applied": {key: "load_applied", editable: true, numeric: true},
                "Date Created": {key: "date_created", editable: false, numeric: false},
                "Date Approved": {key: "date_approved", editable: false, numeric: false} ,
                "Date Modified": {key: "date_modified", editable: false, numeric: false},
                "Status": {key: "status", editable: true, numeric: false},
                "Reviewer ID": {key: "reviewer_id", editable: true, numeric: false},
                "Reviewer Name": {key: "reviewer_name", editable: true, numeric: false},
                "Remarks": {key: "remarks", editable: true, numeric: false},
            }

let url = 'http://127.0.0.1:8000/show-connections'
let update_url = 'http://127.0.0.1:8000/update-connection?ID='
let final_url = ""
let ID_str = ""

const YourComponent = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // Track the current page
  const [searchTerm, setSearchTerm] = useState(''); // New state variable for the search term
  const [isLoadMoreDisabled, setIsLoadMoreDisabled] = useState(false); // New state variable for the search term
  const [originalData, setOriginalData] = useState([]); // Track the original data for canceling edits
  const [editMode, setEditMode] = useState(null); // Track the row being edited
  const [startDate, setStartDate] = useState(new Date('2021-01-01'));
  const [endDate, setEndDate] = useState(new Date('2021-12-31'));

  let body;
  let count;
  useEffect(() => {
    fetchData();
  }, [page, searchTerm, startDate, endDate]); // The empty dependency array ensures that the effect runs only once when the component mounts

  const getDateFilterString = (start, end) => {
    let startDateString = "";
    let endDateString = "";

    if (start) {
      startDateString = start.toISOString().split('T')[0];
    }
    if (end) {
        endDateString = end.toISOString().split('T')[0];
      }
    return {start: startDateString, end: endDateString};

  };
  const fetchData = async () => {
    try {
        const dateFilter = getDateFilterString(startDate, endDate);
        console.log(dateFilter)
        body = {
            from_date: dateFilter.start,
            to_date: dateFilter.end,
            page: page,
            search: searchTerm
        }

      const response = await axios.post(url, body);
      const result =  response.data.data.documents;
      count = response.data.data.count
      setData((prevData) => [...prevData, ...result]);

      checkStatus(count, data.length)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setData([]);
    setPage(1);
    setIsLoadMoreDisabled(false)
  };

  const checkStatus = (count, data_length) => {
    if(count <= data_length){
        setIsLoadMoreDisabled(true)
    }
    else{
        setIsLoadMoreDisabled(false)
    }
  }

  const handleEdit = (rowIndex) => {
    setEditMode(rowIndex);
    setOriginalData(JSON.parse(JSON.stringify(data)));
  };

  const handleCancel = () => {
    setData(originalData);
    setOriginalData([])
    setEditMode(null);

  };


  const handleSave = async (rowIndex, updatedData) => {
    try {
        ID_str = updatedData.ID.toString()
        final_url = update_url+ID_str

        for (let key_name in key_names) {
            if(key_names[key_name].editable === false){
                delete updatedData[key_names[key_name].key]
            }
        }
      const response = await fetch(final_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const newData = [...data];
      newData[rowIndex] = updatedData;
      setData(newData);

      setEditMode(null);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleStartDate = (date) => {
    setStartDate(date)
    setData([])
  };

  const handleEndDate = (date) => {
    setEndDate(date)
    setData([])
  };


  const handleResetDates = () => {
    setStartDate(new Date('2021-01-01'));
    setEndDate(new Date('2021-12-31'));
    setSearchTerm("");
    setData([])
  };
  
  return (
    <>
      <div className="table-complete">
        <div className="sticky-search-form">
            <form className="form-label">
            <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search..." />
            <DatePicker dateFormat="dd-MM-yyyy" selected={startDate} onChange={(date) => handleStartDate(date)} placeholderText="From" />
            <DatePicker dateFormat="dd-MM-yyyy" selected={endDate} onChange={(date) => handleEndDate(date)} placeholderText="To" />
            <button type="button" onClick={handleResetDates}>Reset</button>
            </form>
        </div>
        <div>
        {data ? (
            <div className="table-container">
            <table className="my-table">
                <thead>
                    <tr>
                        {column_names.map((column, index) => (
                            <th key={index}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                        {column_names.map((column, columnIndex) => (
                            <td key={columnIndex}>
                                {editMode === rowIndex && key_names[column].editable ? (
                                // Display input field for editing
                                <input
                                    type="text"
                                    value={item[key_names[column].key]}
                                    onChange={(e) => {
                                        if (number_fields.includes(key_names[column].key) && e.target.value !== "" && !/^\d+$/.test(e.target.value)) {
                                            return; // Do not update if it's not a valid number
                                        }
                                        if(key_names[column].key === "load_applied" && e.target.value !== "" && Number(e.target.value) > 200){
                                            alert('Load applied cannot be more than 200.');
                                            return;
                                        }
                                        else if(key_names[column].key === "pincode" && e.target.value.length > 6){
                                            return;
                                        }
                                        const newData = [...data];
                                        newData[rowIndex][key_names[column].key] = e.target.value;
                                        setData(newData);
                                    }}
                                />
                                ) : (
                                    // Display data
                                    item[key_names[column].key]
                                )}
                            </td>
                        ))}
                        <td>
                            {editMode === rowIndex ? (
                                // Show save and cancel button when in edit mode
                                <>
                                <button type="button" className="btn btn-success mx-2" onClick={() => handleSave(rowIndex, item)}>Save</button>
                                <button type="button" className="btn btn-warning mx-2" onClick={() => handleCancel(rowIndex)}>Cancel</button>
                                </>
                            ) : (
                                // Show edit button when not in edit mode
                                <button type="button" className="btn btn-secondary" onClick={() => handleEdit(rowIndex)}>Edit</button>
                            )}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
        ) : (
            <p>Loading...</p>
        )}
        </div>
        <div className="d-grid gap-2 col-2 mx-auto my-3">
            <button type="button" className="btn btn-dark" onClick={handleLoadMore} disabled={isLoadMoreDisabled}>Load More</button>
        </div>
        </div>
    </>
  );
};


export default YourComponent;