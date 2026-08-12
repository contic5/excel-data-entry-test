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

  useEffect(()=>{
    async function load_data()
    {
      if(excel_data==null||excel_data.length==0)
      {
        let excel_data_temp=await get_data("MOCK_DATA.xlsx","data");
        console.log(excel_data_temp);
        setExcelData(excel_data_temp);
      }
    }
    load_data();
  },[]);

  useEffect(()=>{
    if(excel_data!=null&&excel_data.length>0)
    {
     let filtered_data_temp=excel_data.slice(0,50);
      console.log(filtered_data_temp);
      setFilteredData(filtered_data_temp);
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

      let excel_data_table_temp=filtered_data.map((row,row_number)=>(<tr>
      {
        headers.map((header: any,column_number:number)=><td>
        <input></input>
        </td>)
      }
      </tr>));

      console.log(excel_data_table_temp);
      setExcelDataTable(excel_data_table_temp);
    }
  },[filtered_data,excel_data])


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
