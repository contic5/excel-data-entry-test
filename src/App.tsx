import { useState,useEffect } from 'react'
import get_data from './read_excel'
import React from 'react'
import { shuffle_values } from './support';

function App() 
{
  const [input_entry_table,setInputEntryTable]=useState<React.JSX.Element[]>();
  const [headers_row,setHeadersRow]=useState<React.JSX.Element[]>();
  const [displayed_rows,setDisplayedRows]=useState<React.JSX.Element[]>();

  //Excel data is stored as dictionary for easier column access.I care about access the exact column name.
  const [sample_data, setSampleData] = useState<Record<any,any>[]>([]);
  const [filtered_data,setFilteredData]=useState<Record<any,any>[]>([]);

  //Inputs are stored as standard 2d array for easier tracking.
  const [input_values,setInputValues]=useState<string[][]>([]);
  const [last_index,setLastIndex]=useState([-1,-1]);

  const [accurate_cells,setAccurateCells]=useState(0);
  const [completed_cells,setCompletedCells]=useState(0);

  const [total_rows,setTotalRows]=useState(50);
  const [seconds,setSeconds]=useState(0);

  function update_inputs(e:React.ChangeEvent<HTMLInputElement>)
  {
    let input_values_temp=[...input_values];
    if(e.target!=null)
    {
      //Access the row and column through the input element name
      const name = e.target.name;
      let parts=name.split("_");
      let row=parseInt(parts[1]);
      let column=parseInt(parts[2]);
      const value= e.target.value;

      //Update input value
      input_values_temp[row][column]=value;
      setInputValues(input_values_temp);

      //Store the last row and column that was updated.
      setLastIndex([row,column]);
    }
  }
  function update_total_rows(e:React.ChangeEvent<HTMLInputElement>)
  {
    const value= parseInt(e.target.value);
    if(value==null||Number.isNaN(value))
    {
      setTotalRows(1);
    }
    else
    {
      setTotalRows(value);
    }
  }

  function filter_data(prev_input_values:any[]=[])
  {
    let filtered_data_temp=sample_data.slice(0,total_rows);
    setFilteredData(filtered_data_temp);

    //Reset all inputs
    let total_headers=Object.keys(filtered_data_temp[0]).length;
    let input_values_temp:any=[];
    for(let i=0;i<total_rows;i++)
    {
      
      input_values_temp.push([]);
      for(let j=0;j<total_headers;j++)
      {
        if(i<prev_input_values.length)
        {
          input_values_temp[i][j]=prev_input_values[i][j];
        }
        else
        {
          input_values_temp[i].push("");
        }
      }
    }
    //Reset last index to [-1,-1]
    setLastIndex([-1,-1]);
    setInputValues(input_values_temp);
  }
  function shuffle_sample_data()
  {
    //Shuffle array and get the first 50 rows.
    setSeconds(0);
    let sample_data_temp=[...sample_data];
    sample_data_temp=shuffle_values(sample_data_temp);
    setSampleData(sample_data_temp);
  }

  //Load the mock participant data
  useEffect(()=>{
    async function load_data()
    {
      if(sample_data==null||sample_data.length==0)
      {
        let sample_data_temp=await get_data("MOCK_DATA.xlsx","data");
        setSampleData(sample_data_temp);
      }
    }
    load_data();
  },[]);

  //If the excel data has been shuffled, reroll all values.
  useEffect(()=>{
    if(sample_data!=null&&sample_data.length>0)
    {
      filter_data();
    }
  },[sample_data])

   //If the number of rows has been changed, just use the old values.
  useEffect(()=>{
    if(sample_data!=null&&sample_data.length>0)
    {
      filter_data([...input_values]);
    }
  },[total_rows])


  //Display the filtered data in a grid so people can enter it.
  useEffect(()=>{
    if(filtered_data!=null&&filtered_data.length>0)
    {
      //Get all of the headers
      let headers=Object.keys(filtered_data[0]);

      //Map each header to a th
      let headers_row_temp=headers.map(header=>(
        <th scope="col">{header}</th>
      ));
      setHeadersRow(headers_row_temp);

      //Make a grid cell for each item in filtered data.
      let displayed_rows_temp=filtered_data.map(row=>
      <div className='row mb-2 bg-light border rounded'>
      <div className='col'>
      <p>{row['first_name']+" "+row['last_name']}</p>
      <p>{row['email']}</p>
      <p>{row['city']+","+row['state']}</p>
      </div></div>);
      setDisplayedRows(displayed_rows_temp);
    }
  },[filtered_data])

  //Set up data entry cell.
  function handle_cell(header:any,column_number:number,row_number:number)
  {
    //The classname indicates if the cell is correct, incorrect or not done yet.
    let td_classname="";

    //If the cell input matches with the data, make the cell have a success background.
    if(input_values[row_number][column_number]==filtered_data[row_number][header])
    {
      td_classname="table-success";
    }

    //If the cell input does not match with the data and you are on a different cell, make the cell have an incorrect background.
    else if((row_number!=last_index[0]||column_number!=last_index[1])&&input_values[row_number][column_number]!="")
    {
      td_classname="table-danger";
    }

    return (<td className={td_classname}>
    <input name={`input_${row_number}_${column_number}`} value={input_values[row_number][column_number]} onChange={update_inputs} onFocus={update_inputs}></input>
    </td>);
  }

  //Loop through each input row
  function handle_row(row:Record<any, any>,row_number:number)
  {
    let headers=Object.keys(row);
    return(<tr>
    {
      headers.map((header,column_number) => handle_cell(header,column_number,row_number))
    }
    </tr>);
  }

  //Track time passed
  useEffect(() => {
    // 1. Start the interval
    const intervalId = setInterval(() => {
      // 2. Use a functional state update to always get the freshest value
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    // 3. Return a cleanup function to clear the interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty array ensures the interval is only set up once

  //Update input entry table when the user changes and input
  useEffect(()=>{
    if(filtered_data!=null&&filtered_data.length>0)
    {
      //Set up input entry table based on correct and incorrect answers.
      let input_entry_table_temp=filtered_data.map(handle_row);
      setInputEntryTable(input_entry_table_temp);

      //Track how many cells have been accurately completed and have been completed.
      let accurate_cells_temp=0;
      let completed_cells_temp=0;
      let headers=Object.keys(filtered_data[0]);

      for(let i=0;i<filtered_data.length;i++)
      {
        for(let j=0;j<headers.length;j++)
        {
          const header=headers[j];
          if(input_values[i][j]==filtered_data[i][header])
          {
            accurate_cells_temp+=1;
            completed_cells_temp+=1;
          }
          else if((last_index[0]!=i||last_index[1]!=j)&&input_values[i][j])
          {
            completed_cells_temp+=1;
          }
        }
      }
      setAccurateCells(accurate_cells_temp);
      setCompletedCells(completed_cells_temp);
    }
  },[filtered_data,sample_data,input_values]);

  let accuracy=0;
  if(completed_cells>0)
  {
    accuracy=Math.round((100*accurate_cells)/completed_cells);
  }

  let seconds_written="";
  seconds_written+=seconds%60;
  if(seconds<10)
  {
    seconds_written="0"+seconds_written;
  }
  let minutes=Math.floor(seconds/60);
  if(minutes==0)
  {
    seconds_written="0:"+seconds_written;
  }
  else
  {
    seconds_written=minutes+":"+seconds_written;
  }
  return (
    <>
      <h1>Excel Data Entry Test</h1>
      <h2>About</h2>
      <p>The Excel Data Entry Test loads an Excel file created with Mockaroo and lets users practice entering realistic Excel data. The webpage tracks completed cells and the user's accuracy rate. Users can set how many rows they would like to type and randomize the data they have. This project will let students practice entering data.</p>
      <h2>Results</h2>
      <div className='container .container-fit' style={{marginLeft:0, fontSize:18}}>
      <div className='row mb-2 bg-light'>
      <div className='col p-3 border rounded'>Accurate Cells: {accurate_cells}</div>
      <div className='col p-3 border rounded'>Completed Cells: {completed_cells}</div>
      <div className='col p-3 border rounded'>Accuracy: {accuracy}%</div>
      <div className='col p-3 border rounded'>Time: {seconds_written}</div>
      <div className='col p-3 border rounded'>
        <label htmlFor='rows'>Rows:</label>
        <input id='rows' onChange={update_total_rows} type="number" value={total_rows} min={1} max={999} required/>
      </div>
      <div className='col p-3 border rounded'>
        <button onClick={shuffle_sample_data}>Reroll Data</button></div>
      </div>
      </div>
      
      <div className="grid">
      <div className="vertical-scroll">
      <table className="table table-striped table-bordered">
      <thead>
      <tr>
      {headers_row}
      </tr>
      </thead>
      <tbody>
      {input_entry_table}
      </tbody>
      </table>
      </div>
      <div className="container vertical-scroll">
      {displayed_rows}
      </div>
      </div>
    </>
  )
}

export default App
