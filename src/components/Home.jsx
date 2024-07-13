
import React, { useState, useEffect, Fragment } from "react";
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { IoSettingsOutline } from "react-icons/io5";
import { FiRefreshCcw } from "react-icons/fi";
import {
    Container,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import axios from "axios";
import io from 'socket.io-client';
const apiClient = axios.create({
    withCredentials: false
});

const socket = io('http://localhost:5000/');

const Home = () => {
    const [Scales50Kg, setScales50Kg] = useState({});
    const [scanData, setScanData] = useState('');
    const [username, setUsername] = useState('');
    const [neto, setNeto] = useState(0);
    const [isFreeze, freezeNeto] = useState(false);
    const [isFinalStep, setFinalStep] = useState(false);
    const [containerName, setContainerName] = useState('');
    const [rollingDoorId, setRollingDoorId] = useState(-1);
    //const [socket,setSocket] = useState(io('http://localhost:5000/')); // Sesuaikan dengan alamat server
    //    const socket = null;
    const navigation = [
        { name: 'Dashboard', href: '#', current: true },
        { name: 'Calculation', href: '#', current: false }
    ]

    const [user, setUser] = useState(null);
    const [container, setContainer] = useState(null);
    const [isSubmitAllowed, setIsSubmitAllowed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showModalConfirmWeight, setShowModalConfirmWeight] = useState(false);
    const [wasteId, setWasteId] = useState(null);
    const toggleModal = () => {
        freezeNeto(true);
        setShowModal(!showModal);
    };

    /*const toggleModalConfirm = () => {
        setShowModalConfirmWeight(!showModalConfirmWeight);
    };*/

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    const BorderLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
        height: 10,
        borderRadius: 5,
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 5,
            backgroundColor: value > 70 ? '#f44336' : theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
        },
    }));

    const CustomLinearProgress = ({ value }) => {
        return (
            <LinearProgress
                variant="determinate"
                value={value}
                color={value > 70 ? 'error' : 'primary'}
                style={{ width: '90%', height: 10, borderRadius: 5, marginRight: '10px' }}
            />
        );
    };

    useEffect(() => {
	socket.emit('connectScale');
        socket.on('data', (weight50Kg) => {
            try {
                //console.log(weight50Kg)
                weight50Kg.weight50Kg = weight50Kg && weight50Kg.weight50Kg ? parseFloat(weight50Kg.weight50Kg.replace("=", "") ?? '0') : 0;
                //  console.log(weight50Kg)
                setScales50Kg(weight50Kg);
            }
            catch { }
        });
    }, []);
    useEffect(() => {
        const weight = Scales50Kg?.weight50Kg ?? 0;
        const binWeight = container?.weightbin ?? 0;
	//weight = weight - binWeight;
        //	console.log({w:weight,bin:binWeight,w2:Scales50Kg,c:container});
        if (isFreeze)
            return
        setNeto(weight)
    }, [Scales50Kg])

    async function sendRollingDoorUp() {
        try {
            console.log(container);
            const response = await apiClient.post(`http://localhost:5000/rollingdoorUp`, {
                idRollingDoor: rollingDoorId
            });
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }
    const triggerAvailableBin = async (valueIsOpen,wasteId)=>{
        try
        {
            const response  = await apiClient.post("http://localhost:5000/triggerAvailbleBin",{
                wasteId : wasteId,
                valueIsOpen: valueIsOpen
            });
            console.log(response);
        }
        catch (error){
            console.error(error);
        }
    }
    const handleScan = () => {
        apiClient.post('http://localhost:5000/ScanBadgeid', { badgeId: scanData })
            .then(res => {
                setScanData('');
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    if (res.data.user) {
                        setUser(res.data.user);
                        setScanData('');
                    } else {
                        alert("User not found");
                        setUser(null);
                        setContainerName(res.data.name || '');
                        setScanData('');
                    }
                }
            })
            .catch(err => {setScanData('');console.error(err);});
    };

    const handleScan1 = () => {
        apiClient.post('http://localhost:5000/ScanContainer', { containerId: scanData })
            .then(res => {
                setScanData('');
                if (res.data.error) {
                    alert(res.data.error);
                } else {
                    if (res.data.container) {
                        if (res.data.container.idWaste != wasteId && wasteId != null) {
                            alert("Waste  Mismatch");
                            return;
                        }
                        setContainer(res.data.container);
                        triggerAvailableBin(true,res.data.container.idWaste);
                        setScanData('');
                        setIsSubmitAllowed(true);

                    } else {
                        alert("Countainer not found");
                        setUser(null);
                        setContainer(null);
                        setContainerName(res.data.name || '');
                        setScanData('');
                        setIsSubmitAllowed(false);
                    }
                }
            })
            .catch(err =>{setScanData(''); console.error(err);});
    };
    useEffect(() => {
        const work1 = async () => {
	        await sendRollingDoorUp();
        }
        if (rollingDoorId > -1)
        {
            work1();
        }
    }, [rollingDoorId]);
    const handleSubmit = () => {
        const binWeight = container?.weightbin ?? 0;
        const totalWeight = parseFloat(neto) + parseFloat(binWeight);
        console.log(binWeight);
        if (totalWeight > 100) {
            // setErrorMessage('bin penuh.');
            return;
        }
        CheckBinCapacity();

    }
    const saveTransaksi = () => {
        apiClient.post("http://localhost:5000/SaveTransaksi", {
            payload: {
                idContainer: container.containerId,
                badgeId: user.badgeId,
                idWaste: container.idWaste,
                neto: neto
                //              createdAt: new Date().toISOString().replace('T', ' ')
            }
        }).then(res => {
            setWasteId(container.idWaste);
            setIsSubmitAllowed(false);
            setScanData('');
            toggleModal();
            setShowModalConfirmWeight(true);
            // CheckBinCapacity();
        });
    }

    const CheckBinCapacity = async () => {
        try {
            console.log(container);
            const response = await apiClient.post('http://localhost:5000/CheckBinCapacity', {
                type_waste: container.idWaste,
                neto: neto
            });
            
            const res = response.data;
            if (!res.success) {
                alert(res.message);
                return;
            }
            await triggerAvailableBin(false,container.idWaste);
            setRollingDoorId(res.bin.id);
            saveTransaksi();
            console.log(response);
        }
        catch (error) {
            console.error(error);
        }
    }

    const closeRollingDoor = async () => {
        try {
            const response = await apiClient.post(`http://localhost:5000/rollingdoorDown`, {
                idRollingDoor: rollingDoorId,
            }).then(x => {
                setWasteId(null);
//                updateBinWeight();
            });
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }
    const updateBinWeight = async () => {
        try {
            const response = await apiClient.post('http://localhost:5000/UpdateBinWeight', {
                binId: rollingDoorId,
                neto: neto
            });
            await triggerAvailableBin(false,container.idWaste);
        closeRollingDoor();
		setRollingDoorId(-1);
                setScanData('');
                setUser(null);
                setContainer(null);
                setNeto(0);
		freezeNeto(false);
                setFinalStep(false);
                setIsSubmitAllowed(false);
                await sendDataPanasonicServer();
                await sendDataPanasonicServer1();
        }
        catch (error) {
            setScanData('');
            console.error(error);
        }
    }
    const updateBinWeightConfirm = async () => {
        try {
            const response = await axios.post('http://localhost:5000/UpdateBinWeight', {
                binId: rollingDoorId,
                neto: neto
            });                    
            await triggerAvailableBin(false,container.idWaste);
            setRollingDoorId(-1);
            setScanData('');
            setContainer(null);
            freezeNeto(false);
            setFinalStep(false);
            setIsSubmitAllowed(false);

        }
        catch (error) {
            console.error(error);
        }
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (user == null)
                handleScan();
            else if (isFinalStep) {
                console.log(wasteId);
                console.log(container.waste.bin.filter(x => x.type_waste == wasteId));
                console.log(container);
                if (container.waste.bin.filter(x => x.type_waste == wasteId).length < 1) {
                    alert("Mismatch Name: " + scanData);
                    return;
                }
                updateBinWeight();
            }
            else {
                handleScan1();
            }
        }
    };

    const handleCancel = () => {
        toggleModal();
	freezeNeto(false);
    };
    const handleCancelConfirmModal = () => {
        setShowModalConfirmWeight(false);
        setFinalStep(true);
        //        updateBinWeight();
        //setWasteId(null);
    }

    const ConfirmModal = () => {
        triggerAvailableBin(false,container.idWaste)
        setShowModalConfirmWeight(false);
        updateBinWeightConfirm();
    };

    const sendDataPanasonicServer = async () => {
        try {
            //console.log(badgeno, stationname, frombinname,tobinname,activity);
            //let stationname = containerName.split('-').slice(0, 3).join('-');
            const response = await apiClient.post(`http://${process.env.REACT_APP_PIDSG}/api/pid/activityLogTempbyPc`, {
                badgeno: user.badgeId,
                stationname: "STEP 3 COLLECTION",
                frombin: container.name,//"2-PCS-5",
                weight: neto,
                activity: 'Movement by System',
                filename: null,
                postby: "Local Step 3"

            });
            console.log(response)
            if (response.status != 200) {
                console.log(response);
                return;
            }
            
        }
        catch (error) {
            console.log(error);
        }
    };

    const sendDataPanasonicServer1 = async () => {
        try {
            //console.log(badgeno, stationname, frombinname,tobinname,activity);
            //let stationname = containerName.split('-').slice(0, 3).join('-');
            console.log(container);
            const toBin = container.waste.bin.filter(x => x.type_waste == wasteId)[0];
            console.log(toBin);
            const response = await apiClient.post(`http://${process.env.REACT_APP_PIDSG}/api/pid/activityLogbypc`, {
                stationname: "STEP 3 COLLECTION",
                frombin: container.name,
                tobin: toBin.name,

            });
            console.log(response)
            if (response.status != 200) {
                console.log(response);
                return;
            }
            
        }
        catch (error) {
            console.log(error);
        }
    };


    return (
        <main>
            <Disclosure as="nav" className="bg-gray-800">
                {({ open }) => (
                    <>
                        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                            <div className="relative flex h-16 items-center justify-between">
                                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                    {/* Mobile menu button*/}
                                    <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                        <span className="absolute -inset-0.5" />
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div >
                                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                    <div className="flex flex-shrink-0 items-center">
                                        <img
                                            className="h-8 w-auto"
                                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                            alt="Your Company"
                                        />
                                    </div>
                                    <div className="hidden sm:ml-6 sm:block">
                                        <div className="flex space-x-4">
                                            {navigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                        'rounded-md px-3 py-2 text-sm font-medium'
                                                    )}
                                                    aria-current={item.current ? 'page' : undefined}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                    <button
                                        type="button"
                                        className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                    >
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">View notifications</span>
                                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>

                                    {/* Profile dropdown */}
                                    <Menu as="div" className="relative ml-3">
                                        <div>
                                            <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                                <span className="absolute -inset-1.5" />
                                                <span className="sr-only">Open user menu</span>
                                                <IoSettingsOutline fontSize="1.5em" style={{ color: 'white' }} />
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#"
                                                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                        >
                                                            Your Profile
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#"
                                                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                        >
                                                            Settings
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#"
                                                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                        >
                                                            Sign out
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </div >
                        </div >

                        <Disclosure.Panel className="sm:hidden">
                            <div className="space-y-1 px-2 pb-3 pt-2">
                                {navigation.map((item) => (
                                    <Disclosure.Button
                                        key={item.name}
                                        as="a"
                                        href={item.href}
                                        className={classNames(
                                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                            'block rounded-md px-3 py-2 text-base font-medium'
                                        )}
                                        aria-current={item.current ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </Disclosure.Button>
                                ))}
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure >
            <div className='bg-[#f4f6f9] p-5'>
                <div className="grid grid-cols-3 grid-flow-col gap-5">
                    <div className="row-span-2 col-span-2">
                        <div className='flex-1 p-4 border rounded bg-white'>
                            <h1 className='text-blue-600 font-semibold mb-2 text-xl'>Bruto</h1>
                            <div className=''>
                                <div className='flex-1 flex justify-center p-4 border rounded bg-gray-200 text-5xl font-semibold'>{Scales50Kg.weight50Kg}<FiRefreshCcw size={20} /></div>
                                <p className='flex justify-center text-2xl font-bold'>Kilogram</p>
                            </div>
                        </div>
                    </div>
                    <div className="row-span-1 col-span-2">
                        <div className='flex-1 p-4 border rounded bg-white'>
                            <h1 className='text-blue-600 font-semibold mb-2 text-xl'>Neto</h1>
                            <div className=''>
                                <div className='flex-1 flex justify-center p-4 border rounded bg-gray-200 text-5xl font-semibold'>{neto} <FiRefreshCcw size={20} /></div>
                                <p className='flex justify-center text-2xl font-bold'>Kilogram</p>
                            </div>
                        </div>
                    </div>
                    <div className="row-span-3">
                        <div className='flex-1 p-4 border rounded bg-white h-full'>
                            <h1 className='text-blue-600 font-semibold text-xl mb-3'>Scanner Result</h1>
                            <p>Scan Please</p>
                            <input
                                type="text"
                                onChange={e => setScanData(e.target.value)}
                                value={scanData}
                                name="text"
                                onKeyDown={e => handleKeyPress(e)}
                                className="block w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="luGGIatKmKvdMkcxpKc8SZD64ex5W0"
                            />
                            <button className='block w-full border rounded py-2 flex justify-center items-center font-bold mt-5 bg-sky-400 text-white text-lg' disabled={!isSubmitAllowed} onClick={toggleModal}>Submit</button>
                            <div className='text-lg mt-5'>
                                <p>Username: {user?.username} </p>
                                <p>Container Id: {container?.name}</p>
                                <p>Type Waste: {container?.waste.name}</p>
                            </div>
                        </div></div>
                </div>

            </div>
            <div className='flex justify-start'>
                {showModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                            <div className="bg-white rounded p-8 max-w-md mx-auto z-50">
                                <div className="text-center mb-4">

                                </div>
                                <form>
                                    <Typography variant="h4" align="center" gutterBottom>
                                        {neto}Kg
                                    </Typography>
                                    <p>Data Timbangan Sudah Sesuai?</p>
                                    <div className="flex justify-center mt-5">
                                        <button type="button" onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mr-2 rounded">Ok</button>
                                        <button type="button" onClick={handleCancel} className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className='flex justify-start'>
                {showModalConfirmWeight && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                            <div className="bg-white rounded p-8 max-w-md mx-auto z-50">
                                <div className="text-center mb-4">

                                </div>
                                <form>
                                    <Typography variant="h6" align="center" gutterBottom>
                                        <p>Data Timbangan Telah DiSave!</p>
                                        <p>Rolling Door {rollingDoorId} Telah Dibuka!</p>
                                    </Typography>
                                    <p>Ingin Menimbang lagi ??</p>
                                    <div className="flex justify-center mt-5">
                                        <button type="button" onClick={ConfirmModal} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mr-2 rounded">Ok</button>
                                        <button type="button" onClick={handleCancelConfirmModal} className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <footer className='flex-1 rounded border flex justify-center gap-40 p-3 bg-white'  >
                <p>Server Status: 192.168.1.5 Online</p>
                <p>Status PLC : Online</p>
            </footer>
        </main >
    );
};

export default Home;
