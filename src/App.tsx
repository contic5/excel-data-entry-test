import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import get_data from './read_excel'
import React from 'react'

function App() 
{
  const [excel_data, setExcelData] = useState<Record<any,any>[]>([]);
  const [filtered_data,setFilteredData]=useState<Record<any,any>[]>([]);

  const [excel_data_table,setExcelDataTable]=useState<React.JSX.Element[]>();
  const [headers_row,setHeadersRow]=useState<React.JSX.Element[]>();
  const [displayed_rows,setDisplayedRows]=useState<React.JSX.Element[]>();
  const [input_values,setInputValues]=useState<string[][]>([]);
  const [last_index,setLastIndex]=useState([0,0]);

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
    }
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
      let filtered_data_temp=excel_data.slice(0,50);
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
      setInputValues(input_values_temp);
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

  useEffect(()=>{
    if(filtered_data!=null&&filtered_data.length>0)
    {
      let headers=Object.keys(filtered_data[0]);
      let excel_data_table_temp=filtered_data.map((row,row_number)=>(<tr>
      {
        headers.map((header: any,column_number:number)=><td>
        <input name={`input_${row_number}_${column_number}`} value={input_values[row_number][column_number]} onChange={update_inputs}></input>
        </td>)
      }
      </tr>));
      setExcelDataTable(excel_data_table_temp);
    }
  },[filtered_data,excel_data,input_values]);


  return (
    <>
      <h1>Excel Data Entry Test</h1>
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
