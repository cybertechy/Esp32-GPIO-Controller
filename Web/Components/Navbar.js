"use client";
import React, { useEffect} from "react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSWRMutation from 'swr/mutation';
import {create} from "zustand";


/*
    Connection Store
*/
export const useConnection = create((set) => ({
    ConnectionData: null,
    ConnectionStatus: 'Connect',
    mode: 'Wifi',
    Reconnect: false,
    setConnectionData: (ConnectionData) => set({ ConnectionData }),
    setMode: (mode) => set({ mode: mode }),
    resetConnection: () => set({ ConnectionData: null , ConnectionStatus: 'Connect' }),
    setConnectionStatus: (status) => set({ ConnectionStatus: status }),
    setReconnect: (status) => set({ Reconnect: status }),
}));


function Navbar() {

    // Connection States
    const Connection = useConnection((state) => state.ConnectionStatus);
    const setConnection = useConnection((state) => state.setConnectionStatus);
    const ConnectInst = useConnection();


    // Trigered when Connect button is pressed
    const fetcher =(url) => axios.get(url).then((res) => res.data);
    var { trigger, data, error, isMutating, reset } = useSWRMutation('http://esp32.local/api/establishConnection', fetcher,{revalidate: true,refreshInterval: 2000});
    
    const ConnectToDevice = () => {
        // Reset any previous connection data
        reset();

        // Trigger the mutation
        trigger();
    
        console.log(data);
    }
    


// Update Connection Status
    useEffect(() => {
        if (data && Object.keys(data).length !== 0) {
            console.log("Setting Connection Data");
            ConnectInst.setConnectionData({ ssid: data.ssid, ip: data.ip });
            ConnectInst.setReconnect(true);
            setConnection('Connected');
            toast.success("Connected via " + data.ssid, { position: "bottom-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "dark", });
        }
        
        else if (isMutating) 
            setConnection('Connecting ...');

        else if (error) {
            setConnection('Connect');
            toast.error("Error: " + error.message, { position: "bottom-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "dark", });
        }     
    }, [data, isMutating, error, setConnection]);

  
    return <>
        <nav className='flex flex-row gap-10 p-3 w-full bg-black dark:bg-slate-800 justify-center items-center'>
            <p className='text-2xl font-semibold'> ESP32 Controller </p>
            <span className='hidden bg-red-400'></span>
            <span className='hidden bg-red-700 '></span>
            <span className='hidden bg-green-800'></span>
            <span className='hidden bg-sky-700'></span>
        </nav>
        <ToastContainer />
        <section className="lg:fixed right-2 bg-black dark:bg-slate-800 rounded-sm lg:mt-8 border-b shadow-md lg:border border-green-500 p-3 lg:w-56 h-fit ">
            <div className="flex flex-col justify-between items-center w-full">
                <button disabled={ConnectInst.ConnectionData && Object.keys(ConnectInst.ConnectionData).length !== 0} onClick={ConnectToDevice} className='p-2 bg-green-700 hover:bg-green-600 disabled:bg-green-800 rounded-sm w-32 transition-colors delay-75'> {Connection} </button>
                {ConnectInst.ConnectionData && Object.keys(ConnectInst.ConnectionData).length !== 0 && <p className="mt-2 text-center">Connected via {ConnectInst.ConnectionData?.ssid } </p>}
                {!(ConnectInst.ConnectionData && Object.keys(ConnectInst.ConnectionData).length !== 0) && <div className="flex flex-col text-center pt-2 mt-2">
                <p className=""> Connection Mode: Wifi </p>
                </div>}
            </div>
        </section>
    </>
}
export default Navbar;
