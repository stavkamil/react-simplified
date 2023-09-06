import React, { useState, useEffect } from '../react';

function RandomNum() {
  const [random, setRandom] = useState([]);

  const handleClick = () => {
    const r = [...random, Math.random()];
    setRandom(r);
  };

  useEffect(() => {
    if (random.length) {
      document.title = [...random].pop().toString();
    }
  }, [random]);

  return (
    <div>
      <button onClick={handleClick}>Add Random Number</button>
      <div>
        {random?.map((num) => (
          <div>{num}</div>
        ))}
      </div>
    </div>
  );
}

export default RandomNum;
