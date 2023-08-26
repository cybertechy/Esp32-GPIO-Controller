import React, { useEffect } from "react";
import {create} from "zustand";

export const useTimer = create((set) => ({
    time: 0,
    setTime: (data) => set({ time: data }),
    isRunning: false,
    setIsRunning: (data) => set({ isRunning: data }),
}));

const Stopwatch = () => {

  // Getting time and setTime from useTimer store
  const time = useTimer((state) => state.time);
  const setTime = useTimer((state) => state.setTime);
  const isRunning = useTimer((state) => state.isRunning);
  
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time,setTime]);

  // Minutes calculation
  const minutes = Math.floor((time % 360000) / 6000);

  // Seconds calculation
  const seconds = Math.floor((time % 6000) / 100);

  // Milliseconds calculation
  const milliseconds = time % 100;
  return (
    <div className="stopwatch-container">
      <p className="stopwatch-time">
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}:
        {milliseconds.toString().padStart(2, "0")}
      </p>
    </div>
  );
};

export default Stopwatch;