"use client";
import { useEffect, useReducer, useState } from 'react'
import { toast } from 'react-toastify';
import Image from 'next/image'
import axios from 'axios';
import useSWR from 'swr';
import Button from '../Components/Button';
import { useConnection } from '../Components/Navbar';
import Stopwatch, { useTimer } from '../Components/Stopwatch';

/*
  * This is the reducer function for the GPIO pins
  * It handles all the state changes for the GPIO pins
  * It also handles the communication with the server
  * 
  * @param {Object} state The current state of the GPIO pins
  * @param {Object} action The action to be performed on the GPIO pins
  * 
  * Action has the following properties:
  *  prop: The property of the GPIO pin to be updated
  *  type: The GPIO pin to be updated
  *  payload: The value to be updated
*/
function GPIO_Reducer(state, action) {

  // if the action is to update all the GPIO pins [Used to update the state from the server]
  if (action.Task == "AllStateUpdate" && action.hasOwnProperty("payload")) {
    Object.keys(action.payload).forEach((key) => {

      let GPIO = "GPIO"+key;

      //Do not update state if the Pin in Write Mode
      if(state[GPIO].Mode === "Write") return;

      // Set the Digital Read and Analog Read values
      state[GPIO].Digital.DR = action.payload[key].DR;
      state[GPIO].Analog.AR = action.payload[key].AR;

      // Set Mode if either DR or AR is true
      if(action.payload[key].DR || action.payload[key].AR) state[GPIO].Mode = "Read";

      // IF the pin does not have any value, set the Mode to Off
      if(!action.payload[key].DR && !action.payload[key].AR) state[GPIO].Mode = "Off";
 
    });
  }

  // if the action is to update the mode of the GPIO pin
  else if (action.Task === "Mode" && action.hasOwnProperty("payload") && action.hasOwnProperty("Pin") ) {

    //Create deep copy of the state
    let BackupState = {
      Digital: {... state[action.Pin].Digital},
      Analog: {... state[action.Pin].Analog},
      Mode: state[action.Pin].Mode
    }

    //Update the state
    state[action.Pin].Mode = action.payload;

    //Reset the state to default
    if(action.payload === "Off") {
      state[action.Pin].Digital.Active = false;
      state[action.Pin].Digital.DR = 0;
      state[action.Pin].Digital.DW = 0;
      state[action.Pin].Analog.Active = false;
      state[action.Pin].Analog.AR = 0;
      state[action.Pin].Analog.AW = 0;
      state[action.Pin].Analog.Changing = false;
    }

    //Send the data to the server
    axios.post(`http://${state.IP}/api/gpio`,null,{params:{
      pin: Number(action.Pin.substring(4)),
      Digital: state[action.Pin].Digital.Active ? 1 : 0,
      DW: state[action.Pin].Digital.DW,
      Analog: state[action.Pin].Analog.Active ? 1 : 0,
      AW: state[action.Pin].Analog.AW,
      Reason: "Mode"
      }}).catch((err) => {
      RaiseError("Communication Error");
      state[action.type] = BackupState;
      state.Error = "Communication Error";
    });

  }

  // if the action is to update a single GPIO pin
  else if (action.hasOwnProperty("Pin") && action.hasOwnProperty("prop") && action.hasOwnProperty("payload")) {

    //Create deep copy of the state
    let BackupState = {
      Digital: {... state[action.Pin].Digital},
      Analog: {... state[action.Pin].Analog},
      Mode: state[action.Pin].Mode
    }
     
  
    // update the property of the GPIO pin

    if(action.prop==="DW") {
      state[action.Pin].Digital.DW = action.payload;
      state[action.Pin].Digital.DR = 0;
      state[action.Pin].Digital.Active = action.payload ? true : false;
      state[action.Pin].Mode = "Write";
    }

    if(action.prop==="AW") {
      state[action.Pin].Analog.AW = action.payload;
      state[action.Pin].Analog.AR = 0;
      state[action.Pin].Analog.Active = action.payload ? true : false;
      state[action.Pin].Mode = "Write";
    }

    if(action.prop==="Change"){
      state[action.Pin].Analog.Changing = action.payload;
    }
   
    if (action.prop == "DW" || (action.prop == "Change" && action.payload === false)) {
      axios.post(`http://${state.IP}/api/gpio`,null,{params:{
        pin: Number(action.Pin.substring(4)),
        Digital: state[action.Pin].Digital.Active ? 1 : 0,
        DW: state[action.Pin].Digital.DW,
        Analog:  state[action.Pin].Analog.Active ? 1 : 0,
        AW: state[action.Pin].Analog.AW ,
      }}).catch((err) => {
        RaiseError("Communication Error");
        state[action.type] = BackupState;
        state.Error = "Communication Error";
      });
    }
  }

  // if the action is to change to analog mode
  else if (action.hasOwnProperty("Pin") && action.Task == "ALT") {

   //Create deep copy of the state
   let BackupState = {
    Digital: {... state[action.Pin].Digital},
    Analog: {... state[action.Pin].Analog},
    Mode: state[action.Pin].Mode
  }

    // update the state
    state[action.Pin].Digital.Active = false;
    state[action.Pin].Digital.DR = 0;
    state[action.Pin].Digital.DW = 0;
    state[action.Pin].Analog.Active = true;
    state[action.Pin].Analog.AR = 0;
    state[action.Pin].Analog.AW = 0;
    state[action.Pin].Analog.Changing = false;
    state[action.Pin].Mode = "Write";

    // send the data to the server using axios
    // In case of error, revert the state to the previous state
    axios.post(`http://${state.IP}/api/gpio`,null,{params:{
        pin: Number(action.Pin.substring(4)),
        Digital: state[action.Pin].Digital.Active ? 1 : 0,
        DW: state[action.Pin].DW,
        Analog: state[action.Pin].Analog.Active ? 1 : 0,
        AW: state[action.Pin].AW,
        Reason: "Analog"
        }}).catch((err) => {
        RaiseError("Communication Error");
        state[action.type] = BackupState;
        state.Error = "Communication Error";
      });
  }

  // Configuring the ESP32 IP on the client side network
  else if (action.Task == "SetIP" && action.hasOwnProperty("payload")) {
    state.IP = action.payload;
  }

  // if the action is to reset all the GPIO pins
  else if (action.Task == "AllStateReset") {
    Object.keys(state).forEach((key) => {

      if(!key.startsWith("GPIO")) return;
      
      // Set Digital properties to default
      state[key].Digital.Active = false;
      state[key].Digital.DR = 0;
      state[key].Digital.DW = 0;

      // Set Analog properties to default
      state[key].Analog.Active = false;
      state[key].Analog.AR = 0;
      state[key].Analog.AW = 0;
      state[key].Analog.Changing = false;

      // Set Mode to Off
      state[key].Mode = "Off";

    });
  }

  return { ...state };
}

function RaiseError(Message) {
  if (Message == null) {
    return;
  }

  toast.error(Message, {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
}


export default function Home() {
  // Set States for GPIO Control
  const [state, dispatch] = useReducer(GPIO_Reducer, {
    IP: null,
    Error: null,
    GPIO36: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC1"
    },
    GPIO39: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC1"
    },
    GPIO34: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC1"
    },
    GPIO35: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
    },
    GPIO32: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC1"
    },
    GPIO33: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC1"
    },
    GPIO25: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
    GPIO26: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
    GPIO27: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
    GPIO14: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
    GPIO12: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
    GPIO13: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
    GPIO23: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO22: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO1: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO3: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO21: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO19: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO18: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO5: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO17: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
    },
    GPIO16: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "None"
    },
    GPIO4: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
    GPIO2: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
    GPIO15: {
      Analog: {
        AR: 0,
        AW: 0,
        Active: false,
        Changing: false,
      },
      Digital: {
        DR: 0,
        DW: 0,
        Active: false,
      },
      Mode: "Off",
      ADC: "ADC2"
    },
  });
 
  // Timer Data
  const setTime = useTimer((state) => state.setTime);
  const setIsRunning = useTimer((state) => state.setIsRunning);

  // Connection Data
  const Connection = useConnection();

  // Method to fetch data from Esp32
  const fetcher = (url) => axios.get(url, { timeout: 6000 }).then((res) => res.data);
  var { data, isLoading, error, mutate , isValidating } = useSWR(Connection.ConnectionData?.ip && `http://${Connection.ConnectionData.ip}/api/gpio/all` , fetcher, { refreshInterval: 2000, shouldRetryOnError: true, loadingTimeout: 4000 , revalidateOnReconnect: true  });

  // Method to start timer
  const startTimer = () => setIsRunning(true);

  // Method to reset timer back to 0
  const reset = () => setTime(0);

  useEffect(() => {
    if(Connection.ConnectionStatus === "Connected") {
       mutate();
    }
  }, [Connection.ConnectionStatus])

  // Method to update the state of the GPIO
  useEffect(() => {

    console.log("Reconnect: "+Connection.Reconnect);
  
    if (data && !error) {
      startTimer();
      dispatch({ Task: "AllStateUpdate", payload: data });
      dispatch({ Task: "SetIP", payload: Connection.ConnectionData.ip });
      reset();
      if(Connection.Reconnect) Connection.setReconnect(false);
    }
    if (error && !Connection.Reconnect) {
      Connection.resetConnection();
      dispatch({ Task: "AllStateReset" });
      RaiseError("Connection Lost");
      reset();
    }
  }, [data, error]);

  

  
  return (
    <main className='bg-white text-black dark:bg-gray-950 dark:text-white'>
      <div className='text-center p-8 w-full'>
        <h1 className=' block text-3xl font-bold'> GPIO Controller </h1>
      </div>
      <section className='grid w-full h-fit grid-cols-2 md:grid-cols-3 grid-flow-row auto-cols-auto'>

        <div id="Left_GPIO" className='flex flex-col gap-[5px] px-3 lg:p-3 items-end lg:mt-12 text-white text-sm'>
          <div className='flex gap-5 justify-center items-center'>
            <p className='hidden sm:block font-semibold text-black dark:text-white'> ENABLE </p>
            <button onClick={() => RaiseError("No Actions can be performed on the EN Pin")} className="p-1 rounded-sm w-[4.5rem] sm:w-24 md:w-32 transition-colors delay-0 bg-gray-800 dark:bg-gray-700" > EN </button>
          </div>
          <div className='flex gap-2 '>
            <Button state={state} dispatch={dispatch} PIN="GPIO39" data={data} text="-&gt;" input={false} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO36" data={data} text="-&gt;" input={false} />
          </div>
          <div className='flex gap-2 '>
            <Button state={state} dispatch={dispatch} PIN="GPIO34" data={data} text="-&gt;" input={false} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO35" data={data} text="-&gt;" input={false} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO32" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO33" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO25" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO26" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO27" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO14" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO12" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO13" data={data} />
          </div>
          <div className='flex gap-5 justify-center items-center'>
            <p className='hidden sm:block font-semibold text-black dark:text-white'> GROUND </p>
            <button onClick={() => RaiseError("No Actions can be performed on the GND Pin")} className="p-1 rounded-sm w-[4.5rem] sm:w-24 md:w-32 transition-colors delay-0 bg-gray-800 dark:bg-gray-700" > GND </button>
          </div>
          <div className='flex gap-5 justify-center items-center'>
            <p className='hidden sm:block font-semibold text-black dark:text-white'> POWER </p>
            <button onClick={() => RaiseError("No Actions can be performed on the 3V3 Pin")} className="p-1 rounded-sm w-[4.5rem] sm:w-24 md:w-32 transition-colors delay-0 bg-green-800" > 3V3 </button>
          </div>
        </div>
        <div className='overflow-hidden h-fit object-contain hidden sm:block w-auto '>
          <Image className='mx-auto' src='/esp32.svg' alt='Esp32' width={300} height={627} priority={true} quality={100} sizes='(min-width: 760px) 100vw , (min-width: 640px) 25vw' />
        </div>
        <div className='flex flex-col gap-[5px] px-3 lg:p-3 items-start lg:mt-12 text-white text-sm'>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO23" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO22" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO1" orientation="right" data={data} text="TX" />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO3" orientation="right" data={data} text="RX" />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO21" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO19" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO18" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO5" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO17" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO16" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO4" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO2" orientation="right" data={data} />
          </div>
          <div className='flex gap-2'>
            <Button state={state} dispatch={dispatch} PIN="GPIO15" orientation="right" data={data} />
          </div>
          <div className='flex gap-5 justify-center items-center'>
            <button onClick={() => RaiseError("No Actions can be performed on the GND Pin")} className="p-1 rounded-sm w-[4.5rem] sm:w-24 md:w-32 transition-colors delay-0 bg-gray-800 dark:bg-gray-700" > GND </button>
            <p className='hidden sm:block font-semibold text-black dark:text-white'> GROUND </p>
          </div>
          <div className='flex gap-5 justify-center items-center'>
            <button onClick={() => RaiseError("No Actions can be performed on the 3V3 Pin")} className="p-1 rounded-sm w-[4.5rem] sm:w-24 md:w-32 transition-colors delay-0 bg-green-800" > 3V3 </button>
            <p className='hidden sm:block font-semibold text-black dark:text-white'> POWER </p>
          </div>
        </div>

      </section>
      <section className='flex flex-col gap-2 p-3 items-center mt-12 text-white text-sm'>
        {Connection.ConnectionData && <div className=''>
          <p>Current Status: {isLoading ? "Connecting ... " : "Connected"} </p>
          <div className='flex gap-2'>
            <p >Last Updated:</p>
            <Stopwatch></Stopwatch>
            <p>(M:S:MS)</p>
          </div>
        </div>}
      </section>
    </main>
  )
}