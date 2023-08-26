import React from "react";
import { toast } from "react-toastify";

function RaiseError(Message) {
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

const Button = ({state,PIN,orientation,dispatch,data,text,input}) => {
    const ButtonColours = {
        "Off": "bg-red-700",
        "Write": "bg-green-800",
        "Read": "bg-sky-700"
    }

    const changeToAnalog = (e) => { 
      e.preventDefault();
      dispatch({ Pin: PIN, Task: "ALT" });
    }

    const setAnalogValue = (e) => {
      e.preventDefault();
      dispatch({ Pin: PIN, prop: "AW", payload: e.target.value })
    }

    const confirmAnalogValue = (e) => {
      e.preventDefault();
      dispatch({ Pin: PIN, prop: "Change", payload: !state[PIN].Analog.Changing })
    }

    const toggleMode = (e) => {
      e.preventDefault();
      if(!data) return
     
      if(state[PIN].Mode === "Off") dispatch({ Pin: PIN, prop: "DW", payload: 1 })
      else if(state[PIN].Mode === "Write") dispatch({ Pin: PIN, Task:"Mode" , payload: "Off" })
      else if(state[PIN].Mode === "Read") dispatch({ Pin: PIN, Task:"Mode" , payload: "Off" })
    }




    return <div className={`flex gap-2 justify-center items-center ${orientation==="right" && "flex-row-reverse"} `}>
        {text && <p className='md:flex font-semibold text-black dark:text-white hidden'> {text} </p>}
        { state[PIN].Digital.Active && <button className='text-xl rounded-sm bg-blue-700 px-2' onClick={changeToAnalog} > ~ </button>}
        {state[PIN].Analog.Changing && <input type="range" min="0" max="100" value={state[PIN].Analog.AW} onChange={setAnalogValue} className='w-24 md:w-32 transform -rotate-90 lg:rotate-0 -mr-10 lg:mr-0' />}
        {state[PIN].Analog.Active && <button onClick={confirmAnalogValue}><p className='font-semibold transition-transform text-white bg-purple-700 hover:bg-purple-600 py-1 rounded-sm flex duration-75 w-12 justify-center'> {state[PIN].Analog.AW} % </p></button>}
        {state[PIN].Mode==="Read" &&  <p className='dark:text-white bg-amber-600 rounded-sm px-2 items-center flex'> {state[PIN].Digital.DR ? state[PIN].Digital.DR : "~"+ state[PIN].Analog.AR + " %"} </p>}
        { input === false ? 
             <button onClick={() => {if(!data) return;RaiseError("Can only take Input")}} 
            className={`p-1 rounded-sm w-[4.5rem] sm:w-24 md:w-32 transition-colors duration-15 ${!data ? "bg-red-400" : ButtonColours[state[PIN].Mode]} ${state[PIN].Analog===true && "animate-pulse"}`}> {PIN} </button> :
             <button onClick={toggleMode} 
               className={`p-1 rounded-sm w-[4.5rem] sm:w-24 md:w-32 transition-colors duration-100  ${!data ? "bg-red-400":ButtonColours[state[PIN].Mode]} ${state[PIN].Analog === true && "animate-pulse"}`}> {PIN} </button>
               }
    </div>
};

export default Button;
