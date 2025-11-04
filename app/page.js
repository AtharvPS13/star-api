import { supabase } from '@/lib/supabaseClient';

export default async function Page() {

  const { data: rows, error } = await supabase
    .from('galaxies') 
    .select('*');
  
  if (error) {

  }

  else console.log(rows);
  

   return (
      (rows ? (
        <ul>
          {rows.map((item, index) => (
            <li key={index}>{item.name}</li>
          ))}
        </ul>
      ) : <></>));
    }