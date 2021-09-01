import React, { createContext, useState } from "react";

export const WorkerContext = createContext();

export const WorkerProvider = (props) => {
  const [workers, setWorkers] = useState(null);

  return (
    <WorkerContext.Provider value={[workers, setWorkers]}>
      {props.children}
    </WorkerContext.Provider>
  );
};
