
import React, { Fragment, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { IoSettingsOutline } from "react-icons/io5";
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Pagination from '@mui/material/Pagination';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
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



const Home = () => {
    const navigation = [
        { name: 'Dashboard', href: '#', current: true },
        { name: 'Calculation', href: '#', current: false }
    ]

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

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const handleLogin = () => {
        // Handle login logic here
        // Close modal after login
        toggleModal();
    };

    const handleCancel = () => {
        // Clear username and password fields
        setUsername('');
        setPassword('');
        // Close modal
        toggleModal();
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
                                </div>
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
                            </div>
                        </div>

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
            </Disclosure>
            <div className='bg-[#f4f6f9] p-5'>

                <div className='flex justify-between gap-5'>
                    <div className='flex-1 p-4 border rounded bg-white mt-5'>
                        <h1 className='text-blue-600 font-semibold text-xl'>Bin List</h1>
                        <div class="grid grid-cols-5 gap-4 flex justify-between">
                            <div className=''>
                                <div className='flex-1 p-4 border rounded bg-white mt-5 relative'>
                                    <FiberManualRecordIcon fontSize="small" style={{ color: 'green', position: 'absolute', top: 0, right: 0 }} />
                                    <h1 className='text-center mb-2 font-bold text-lg'>Iron</h1>
                                    <div className='' style={{ display: 'flex', alignItems: 'center' }}>
                                        <BorderLinearProgress variant="determinate" value={70} style={{ width: '90%', height: '12px', marginRight: '10px' }} />
                                        70%
                                    </div>
                                    <div className='text-center mt-2 text-lg font-bold'>
                                        <p>10 kg</p>
                                        <a href='/' className='block w-full border rounded flex justify-center items-center mt-2 bg-sky-400 text-white'>123-123-546</a>
                                    </div>
                                </div>
                            </div>

                            <div className=''>
                                <div className='flex-1 p-4 border rounded bg-white mt-5 relative'>
                                    <FiberManualRecordIcon fontSize="small" style={{ color: 'green', position: 'absolute', top: 0, right: 0 }} />
                                    <h1 className='text-center mb-2 font-bold text-lg'>Iron</h1>
                                    <div className='' style={{ display: 'flex', alignItems: 'center' }}>
                                        <BorderLinearProgress variant="determinate" value={70} style={{ width: '90%', height: '12px', marginRight: '10px' }} />
                                        70%
                                    </div>
                                    <div className='text-center mt-2 text-lg font-bold'>
                                        <p>10 kg</p>
                                        <a href='/' className='block w-full border rounded flex justify-center items-center mt-2 bg-sky-400 text-white'>123-123-546</a>
                                    </div>
                                </div>
                            </div>

                            <div className=''>
                                <div className='flex-1 p-4 border rounded bg-white mt-5 relative'>
                                    <FiberManualRecordIcon fontSize="small" style={{ color: 'green', position: 'absolute', top: 0, right: 0 }} />
                                    <h1 className='text-center mb-2 font-bold text-lg'>Iron</h1>
                                    <div className='' style={{ display: 'flex', alignItems: 'center' }}>
                                        <BorderLinearProgress variant="determinate" value={70} style={{ width: '90%', height: '12px', marginRight: '10px' }} />
                                        70%
                                    </div>
                                    <div className='text-center mt-2 text-lg font-bold'>
                                        <p>10 kg</p>
                                        <a href='/' className='block w-full border rounded flex justify-center items-center mt-2 bg-sky-400 text-white'>123-123-546</a>
                                    </div>
                                </div>
                            </div>

                            <div className=''>
                                <div className='flex-1 p-4 border rounded bg-white mt-5 relative'>
                                    <FiberManualRecordIcon fontSize="small" style={{ color: 'green', position: 'absolute', top: 0, right: 0 }} />
                                    <h1 className='text-center mb-2 font-bold text-lg'>Iron</h1>
                                    <div className='' style={{ display: 'flex', alignItems: 'center' }}>
                                        <BorderLinearProgress variant="determinate" value={70} style={{ width: '90%', height: '12px', marginRight: '10px' }} />
                                        70%
                                    </div>
                                    <div className='text-center mt-2 text-lg font-bold'>
                                        <p>10 kg</p>
                                        <a href='/' className='block w-full border rounded flex justify-center items-center mt-2 bg-sky-400 text-white'>123-123-546</a>
                                    </div>
                                </div>
                            </div>

                            <div className=''>
                                <div className='flex-1 p-4 border rounded bg-white mt-5 relative'>
                                    <FiberManualRecordIcon fontSize="small" style={{ color: 'green', position: 'absolute', top: 0, right: 0 }} />
                                    <h1 className='text-center mb-2 font-bold text-lg'>Iron</h1>
                                    <div className='' style={{ display: 'flex', alignItems: 'center' }}>
                                        <BorderLinearProgress variant="determinate" value={70} style={{ width: '90%', height: '12px', marginRight: '10px' }} />
                                        70%
                                    </div>
                                    <div className='text-center mt-2 text-lg font-bold'>
                                        <p>10 kg</p>
                                        <a href='/' className='block w-full border rounded flex justify-center items-center mt-2 bg-sky-400 text-white'>123-123-546</a>
                                    </div>
                                </div>
                            </div>
                            <div className=''>
                                <div className='flex-1 p-4 border rounded bg-white mt-5 relative'>
                                    <FiberManualRecordIcon fontSize="small" style={{ color: 'green', position: 'absolute', top: 0, right: 0 }} />
                                    <h1 className='text-center mb-2 font-bold text-lg'>Iron</h1>
                                    <div className='' style={{ display: 'flex', alignItems: 'center' }}>
                                        <BorderLinearProgress variant="determinate" value={70} style={{ width: '90%', height: '12px', marginRight: '10px' }} />
                                        70%
                                    </div>
                                    <div className='text-center mt-2 text-lg font-bold'>
                                        <p>10 kg</p>
                                        <a href='/' className='block w-full border rounded flex justify-center items-center mt-2 bg-sky-400 text-white'>123-123-546</a>
                                    </div>
                                </div>
                            </div>
                            <div className=''>
                                <div className='flex-1 p-4 border rounded bg-white mt-5 relative'>
                                    <FiberManualRecordIcon fontSize="small" style={{ color: 'green', position: 'absolute', top: 0, right: 0 }} />
                                    <h1 className='text-center mb-2 font-bold text-lg'>Iron</h1>
                                    <div className='' style={{ display: 'flex', alignItems: 'center' }}>
                                        <BorderLinearProgress variant="determinate" value={70} style={{ width: '90%', height: '12px', marginRight: '10px' }} />
                                        70%
                                    </div>
                                    <div className='text-center mt-2 text-lg font-bold'>
                                        <p>10 kg</p>
                                        <a href='/' className='block w-full border rounded flex justify-center items-center mt-2 bg-sky-400 text-white'>123-123-546</a>
                                    </div>
                                </div>
                            </div>
                            <div className=''>
                                <div className='flex-1 p-4 border rounded bg-white mt-5 relative'>
                                    <FiberManualRecordIcon fontSize="small" style={{ color: 'green', position: 'absolute', top: 0, right: 0 }} />
                                    <h1 className='text-center mb-2 font-bold text-lg'>Iron</h1>
                                    <div className='' style={{ display: 'flex', alignItems: 'center' }}>
                                        <BorderLinearProgress variant="determinate" value={70} style={{ width: '90%', height: '12px', marginRight: '10px' }} />
                                        70%
                                    </div>
                                    <div className='text-center mt-2 text-lg font-bold'>
                                        <p>10 kg</p>
                                        <a href='/' className='block w-full border rounded flex justify-center items-center mt-2 bg-sky-400 text-white'>123-123-546</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-end  mt-5'>
                            <Pagination count={10} color="primary" />
                        </div>
                    </div>

                </div>
            </div>
            {/*     <footer className='flex-1 rounded border flex justify-between gap-40 p-3 bg-white'  >
            <a href='/' className='border rounded flex justify-center items-center bg-white bg-sky-400 text-white p-2'>Auto</a>
                <p>Server Status: 192.168.1.5 Online</p>
                <p>Status PLC : Online</p>
            </footer> */}

            <footer className='flex-1 rounded border gap-40 p-3 bg-white' >
                <div className='flex justify-start'>
                    <button onClick={toggleModal} className="border rounded bg-sky-400 text-white p-2 ml-2">
                        Auto
                    </button>
                    {showModal && (
                        <div className="fixed z-10 inset-0 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                                <div className="bg-white rounded p-8 max-w-md mx-auto z-50">
                                    <div className="text-center mb-4">
                                      
                                    </div>
                                    <form>
                                        <Typography variant="h4" align="center" gutterBottom>
                                           
                                        </Typography>
                                        <TextField
                                            type="text"
                                            label="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            variant="outlined"
                                            fullWidth
                                            margin="normal"
                                            required // This attribute makes the field required
                                        />
                                        <TextField
                                            type="password"
                                            label="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            variant="outlined"
                                            fullWidth
                                            margin="normal"
                                            required // This attribute makes the field required
                                        />
                                    
                                        <div className="flex justify-center mt-5">
                                            <button type="button" onClick={handleLogin} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mr-2 rounded">Ok</button>
                                            <button type="button" onClick={handleCancel} className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className='flex justify-center gap-40'>
                    <p>Server Status: 192.168.1.5 Online</p>
                    <p>Status PLC : Online</p>
                </div>
            </footer>
        </main>
    );
};

export default Home;
