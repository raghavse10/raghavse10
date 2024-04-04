import React, { PureComponent, useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../App.css';


const url = "http://127.0.0.1:8000/graph-connections"


export default function Dashboard() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2021-01-01'));
  const [endDate, setEndDate] = useState(new Date('2021-06-31'));
  const [searchTerm, setSearchTerm] = useState(''); // New state variable for the search term

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, searchTerm]);

  const getDateFilterString = () => {
    let startDateString = "";
    let endDateString = "";

    if (startDate && endDate) {
      startDateString = startDate.toISOString().split('T')[0];
      endDateString = endDate.toISOString().split('T')[0];
      return {start: startDateString, end: endDateString};
    }
    else{
      return "";
    }
  };
  let queryParams;
  const fetchData = async () => {
    try {
      let dateFilter;
      dateFilter = getDateFilterString();
      if(dateFilter === "") {
        return;
      }
      queryParams = {
        from_date: dateFilter.start,
        to_date: dateFilter.end,
        search: searchTerm
      };

      const response = await axios.get(url, { params: queryParams });

      const result =  response.data;
      setData(result);
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setData([]);
  };

  const handleResetDates = () => {
    setStartDate(new Date('2021-01-01'));
    setEndDate(new Date('2021-06-31'));
    setSearchTerm("");
    setData([])
  };
  return (
    <>
      <div className="sticky-date-form">
            <form>
            <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search for status here..." />
              <DatePicker dateFormat="dd-MM-yyyy" selected={startDate} onChange={(date) => handleStartDate(date)} placeholderText="From" />
              <DatePicker dateFormat="dd-MM-yyyy" selected={endDate} onChange={(date) => handleEndDate(date)} placeholderText="To" />
              <button type="button" onClick={handleResetDates}>Reset</button>
            </form>
        </div>
      <div>
        <LineChart
          width={2000}
          height={500}
          data={data}
          margin={{
            top: 90,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#777B7E" activeDot={{ r: 8 }} />
        </LineChart>
      </div>

    </>    
  )
}
