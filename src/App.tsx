import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import get_data from './read_excel'
import React from 'react'

function App() 
{
  const [excel_data, setExcelData] = useState<Record<any,any>[]>([]);
  const [excel_data_table,setExcelDataTable]=useState<React.JSX.Element[]>();

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
      console.log(excel_data);
      let excel_data_table_temp=excel_data.map(row=><tr><td>MODOK</td></tr>);
      let headers=Object.keys(excel_data[0]);
      console.log(headers);
      
      excel_data_table_temp=excel_data.map(row=>(<tr>
      {
        headers.map((header: any)=><td>{row[header]}</td>)
      }
      </tr>));
      

      console.log(excel_data_table_temp);
      setExcelDataTable(excel_data_table_temp);
    }
  },[excel_data])


  return (
    <>
      <h1>Excel Data Entry Test</h1>
      <table>
      <tbody>
      {excel_data_table}
      </tbody>
      </table>
    </>
  )
}

export default App
