export function record_array_to_2d_array(record_array:Record<any,any>[])
{
    let res:any[][]=[];
    for(let row of record_array)
    {
        const keys=Object.keys(row);
        res.push([]);

        let column=0;
        for(let key of keys)
        {
            res[res.length-1][column]=row[key];
        }
    }
    return res;
}