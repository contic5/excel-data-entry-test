let displayed_rows_temp=filtered_data.map(row=><div className='row mb-2 bg-light border'>
      <div className='col'>
      {
        headers.map((header:any)=><p>{row[header]}</p>)

      }
      </div></div>);