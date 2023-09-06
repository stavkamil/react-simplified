import React, { useState, useEffect } from '../react';

function Items() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos');
      const data = await res.json();
      setData(data.slice(0, 8));
    };
    fetchTodos();
  }, []);

  if (!data) return null;

  return (
    <div>
      {data.map((item) => {
        return <div>{item.title}</div>;
      })}
    </div>
  );
}

export default Items;
