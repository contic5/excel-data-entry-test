/*
USAGE

Call await get_data with the target filename.

EXAMPLE
let ride_dictionaries=await get_data("Disneyland Rides.xlsx");

*/

import readExcelFile from 'read-excel-file/browser';

export async function handle_data(data:any)
{
    let dictionaries=[];

    for(let i=1;i<data.length;i++)
    {
        let dictionary:Record<any,any>={};
        for(let j=0;j<data[0].length;j++)
        {
            const key=data[0][j];
            dictionary[key]=data[i][j];
        }
        dictionaries.push(dictionary);
    }
    return dictionaries;
}
async function get_target_sheet(sheets:any,sheet_name:string)
{
    for(let i=0;i<sheets.length;i++)
    {
        if(sheets[i]["sheet"]==sheet_name)
        {
            return sheets[i];
        }
    }
    return null;
}
//Get data from Excel sheet
export async function get_data(target_file:string,sheet_name="Data",start_row=1)
{
    const response=await fetch(target_file);
    const blob=await response.blob();
    // cast options to any to avoid TypeScript type mismatch for the 'sheet' property
    const sheets=await readExcelFile(blob) as any;
   
    const sheet=await get_target_sheet(sheets,sheet_name);
    let data=sheet["data"];

    //Only keep data from start_row-1 to data.length.
    data=data.slice(start_row-1,data.length);

    //Convert array data to dictionaries
    const dictionaries=await handle_data(data);
    
    return dictionaries;
}

export default get_data;