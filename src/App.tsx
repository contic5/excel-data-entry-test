import { useState,useEffect } from 'react'
import get_data from './read_excel'
import React from 'react'
import { shuffle_values } from './support';

function App() 
{
  const [excel_data_table,setExcelDataTable]=useState<React.JSX.Element[]>();
  const [headers_row,setHeadersRow]=useState<React.JSX.Element[]>();
  const [displayed_rows,setDisplayedRows]=useState<React.JSX.Element[]>();

  //Excel data is stored as dictionary for easier column access.I care about access the exact column name.
  const [excel_data, setExcelData] = useState<Record<any,any>[]>([]);
  const [filtered_data,setFilteredData]=useState<Record<any,any>[]>([]);

  //Inputs are stored as standard 2d array for easier tracking.
  const [input_values,setInputValues]=useState<string[][]>([]);
  const [last_index,setLastIndex]=useState([-1,-1]);

  const [accurate_cells,setAccurateCells]=useState(0);
  const [completed_cells,setCompletedCells]=useState(0);

  function update_inputs(e:React.ChangeEvent<HTMLInputElement>)
  {
    let input_values_temp=[...input_values];
    console.log("Try to update inputs");
    if(e.target!=null)
    {
      const name = e.target.name;
      let parts=name.split("_");
      let row=parseInt(parts[1]);
      let column=parseInt(parts[2]);
      const value= e.target.value;
      console.log(value);
      input_values_temp[row][column]=value;
      setInputValues(input_values_temp);
      setLastIndex([row,column]);
    }
  }

  function reroll_values()
  {
    let filtered_data_temp=[...excel_data];
    filtered_data_temp=shuffle_values(filtered_data_temp);
    filtered_data_temp=filtered_data_temp.slice(0,50);
    setFilteredData(filtered_data_temp);

    let input_values_temp:any=[];
    let total_headers=Object.keys(filtered_data_temp[0]).length;
    for(let i=0;i<filtered_data_temp.length;i++)
    {
      input_values_temp.push([]);
      for(let j=0;j<total_headers;j++)
      {
        input_values_temp[i].push("");
      }
    }
    setLastIndex([-1,-1]);
    setInputValues(input_values_temp);
  }

  useEffect(()=>{
    async function load_data()
    {
      if(excel_data==null||excel_data.length==0)
      {
        let excel_data_temp=await get_data("MOCK_DATA.xlsx","data");
        setExcelData(excel_data_temp);
      }
    }
    load_data();
  },[]);

  useEffect(()=>{
    if(excel_data!=null&&excel_data.length>0)
    {
      reroll_values();
    }
  },[excel_data])


  useEffect(()=>{
    if(filtered_data!=null&&filtered_data.length>0)
    {
      console.log(filtered_data);
      let headers=Object.keys(filtered_data[0]);
      console.log(headers);
      
      let headers_row_temp=headers.map(header=>(
        <th scope="col">{header}</th>
      ));
      setHeadersRow(headers_row_temp);

      let displayed_rows_temp=filtered_data.map(row=><div className='row mb-2 bg-light border'>
      <div className='col'>
      <p>{row['first_name']+" "+row['last_name']}</p>
      <p>{row['email']}</p>
      <p>{row['city']+","+row['state']}</p>
      </div></div>);
      setDisplayedRows(displayed_rows_temp);

    }
  },[filtered_data,excel_data])

  function handle_cell(header:any,column_number:number,row_number:number)
  {
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
  function handle_row(row:Record<any, any>,row_number:number)
  {
    let headers=Object.keys(row);
    return(<tr>
    {
      headers.map((header,column_number) => handle_cell(header,column_number,row_number))
    }
    </tr>);
  }
  useEffect(()=>{
    if(filtered_data!=null&&filtered_data.length>0)
    {
      let excel_data_table_temp=filtered_data.map(handle_row);
      setExcelDataTable(excel_data_table_temp);

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
  },[filtered_data,excel_data,input_values]);

  let accuracy=0;
  if(completed_cells>0)
  {
    accuracy=Math.round((100*accurate_cells)/completed_cells);
  }
  return (
    <>
      <h1>Excel Data Entry Test</h1>
      <h2>Results</h2>

      <div className='container fit-content' style={{marginLeft:0}}>
      <div className='row mb-2 bg-light border'>
      <div className='col fit-content'>Accurate Cells: {accurate_cells}</div>
      <div className='col fit-content'>Completed Cells: {completed_cells}</div>
      <div className='col fit-content'>Accuracy: {accuracy}%</div>
      <div className='col fit-content'><button onClick={reroll_values}>Reroll</button></div>
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
      {excel_data_table}
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
