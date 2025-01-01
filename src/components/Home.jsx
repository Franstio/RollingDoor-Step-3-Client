import React, { useState, useEffect, Fragment, useRef } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import axios from "axios";
import io from "socket.io-client";
const apiClient = axios.create({
  withCredentials: false,
  timeout: 5000,
});
const socket = io("http://localhost:5000/", {
  autoConnect: true,
  reconnection: true,
});

const Home = () => {
  const [refresh, setRefresh] = useState(false);
  const [Scales50Kg, setScales50Kg] = useState({});
  const [bruto, setBruto] = useState(0);
  const [allowScan,setAllowScan] = useState(true);
  const [scanData, setScanData] = useState("");
  const [username, setUsername] = useState("");
  const [neto, setNeto] = useState(0);
  const [isFreeze, freezeNeto] = useState(false);
  const [isFinalStep, setFinalStep] = useState(false);
  const [containerName, setContainerName] = useState("");
  const [targetRollingDoor, setTargetRollingDoor] = useState(null);
  const [wasteItems, setWasteItems] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [errData, setErrData] = useState({ show: false, message: "" });
  const [syncing, setSyncing] = useState(false);
  const [ipAddress, setIpAddress] = useState(process.env.REACT_APP_PIDSG);
  //const [socket,setSocket] = useState(io('http://localhost:5000/')); // Sesuaikan dengan alamat server
  //    const socket = null;
  const navigation = [
    { name: "Dashboard", href: "#", current: true },
    { name: "Calculation", href: "#", current: false },
  ];

  const [user, setUser] = useState(null);
  const [container, setContainer] = useState(null);
  const [isSubmitAllowed, setIsSubmitAllowed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalConfirmWeight, setShowModalConfirmWeight] = useState(false);
  const [wasteId, setWasteId] = useState(null);
  const [selectedBin, setSelectedBin] = useState({});
  const [checkInputInverval, setCheckInputInterval] = useState(null);
  const inputRef = useRef(null);
  const toggleModal = () => {
    freezeNeto(true);
    setShowModal(!showModal);
  };

  useEffect(() => {
    const updateFocus = () => {
      if (inputRef && inputRef.current) {
        if (document.activeElement != inputRef.current)
          inputRef.current.focus();
      }
    };
    if (checkInputInverval != null) clearInterval(checkInputInverval);
    setCheckInputInterval(setInterval(updateFocus, 10000));
  }, []);
  /*const toggleModalConfirm = () => {
        setShowModalConfirmWeight(!showModalConfirmWeight);
    };*/

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const BorderLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor:
        value > 70
          ? "#f44336"
          : theme.palette.mode === "light"
            ? "#1a90ff"
            : "#308fe8",
    },
  }));

  const CustomLinearProgress = ({ value }) => {
    return (
      <LinearProgress
        variant="determinate"
        value={value}
        color={value > 70 ? "error" : "primary"}
        style={{
          width: "90%",
          height: 10,
          borderRadius: 5,
          marginRight: "10px",
        }}
      />
    );
  };

  useEffect(() => {
    socket.emit("connectScale");
    socket.on("data", (weight50Kg) => {
      try {
        weight50Kg.weight50Kg =
          weight50Kg && weight50Kg.weight50Kg
            ? parseFloat(weight50Kg.weight50Kg.replace("=", "") ?? "0")
            : 0;
        setScales50Kg(weight50Kg);
      } catch { }
    });
  }, []);
  useEffect(() => {
    let weight = Scales50Kg?.weight50Kg ?? 0;
    const binWeight = container?.weightbin ?? 0;
    weight = weight - binWeight;
    if (isFreeze) return;
    setNeto(weight);
    setBruto(parseFloat(Scales50Kg?.weight50Kg ?? 0));
  }, [Scales50Kg]);
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const res = await apiClient.get(`http://${ipAddress}/`);
        setIsOnline(res.status >= 200 && res.status < 300);
      } catch (er) {
        setIsOnline(false);
      }
    };
    setInterval(() => checkServerStatus(), 3000);
  }, []);
  const triggerAvailableBin = async (valueIsOpen, wasteId) => {
    try {
      const response = await apiClient.post(
        "http://localhost:5000/triggerAvailbleBin",
        {
          wasteId: wasteId,
          valueIsOpen: valueIsOpen,
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
  const handleScan = () => {
    apiClient
      .post("http://localhost:5000/ScanBadgeid", { badgeId: scanData })
      .then((res) => {
        setScanData("");
        if (res.data.error) {
          alert(res.data.error);
        } else {
          if (res.data.user) {
            setUser(res.data.user);
            setScanData("");
          } else {
            alert("User not found");
            setUser(null);
            setContainerName(res.data.name || "");
            setScanData("");
          }
        }
      })
      .catch((err) => {
        setScanData("");
        console.error(err);
      });
  };

  const handleScan1 = () => {
    const check = wasteItems.findIndex(
      (x) => x.name.toLowerCase() == scanData.toLowerCase()
    );
    if (check != -1) {
      setErrData((prev) => ({
        show: true,
        message: "Container sudah diinput sebelumnya",
      }));
      return;
    }
    apiClient
      .post("http://localhost:5000/ScanContainer", { containerId: scanData })
      .then((res) => {
        setScanData("");
        if (res.data.error) {
          alert(res.data.error);
        } else {
          if (res.data.container) {
            if (res.data.container.idWaste != wasteId && wasteId != null) {
              alert("Waste  Mismatch");
              return;
            }
            setContainer(res.data.container);
            triggerAvailableBin(true, res.data.container.idWaste);
            setScanData("");
            setIsSubmitAllowed(true);
          } else {
            alert("Countainer not found");
            setUser(null);
            setContainer(null);
            setContainerName(res.data.name || "");
            setScanData("");
            setIsSubmitAllowed(false);
          }
        }
      })
      .catch((err) => {
        setScanData("");
        console.error(err);
      });
  };
  const handleSubmit = () => {
    CheckBinCapacity();
  };
  const saveTransaksi = async () => {
    console.log(wasteItems);
    for (let i = 0; i < wasteItems.length; i++) {
      await apiClient.post("http://localhost:5000/SaveTransaksi", {
        payload: {
          idContainer: wasteItems[i].containerId,
          badgeId: user.badgeId,
          idWaste: wasteItems[i].idWaste,
          neto: wasteItems[i].weight,
          binId: selectedBin.id,
          containerName: wasteItems[i].name,
          binName: selectedBin.name,
          //              createdAt: new Date().toISOString().replace('T', ' ')
        },
      });
    }
  };
  const saveTransaksiItem = async (data) => {
  const payloads = [];
  for (let i=0<data.length;i++;i++)
  {
    payloads.push({
        idContainer: data[i].containerId,
        badgeId: user.badgeId,
        idWaste: data[i].idWaste,
        neto: data[i].neto,
        binId: selectedBin.id,
        containerName: data[i].name,
        binName: selectedBin.name,
        status: data[i].status,
        isSuccess: data[i].isSuccess,
        //              createdAt: new Date().toISOString().replace('T', ' ')
      });
    }
    await apiClient.post("http://localhost:5000/SaveTransaksi", {payload:payloads});
  };
  const getTotalWeight = () => wasteItems.reduce((a, b) => a + b.weight, 0);

  const getTotalNetoWeight = () => wasteItems.reduce((a, b) => a + b.neto, 0);
  const CheckBinCapacity = async () => {
    try {
      setShowModal(false);
      freezeNeto(false);
      let maxWeight = selectedBin?.max_weight ?? 0;
      const binWeight = container?.weightbin ?? 0;
      let totalWeight = parseFloat(neto);
      if (wasteItems.length < 1) {
        const response = await apiClient.post(
          "http://localhost:5000/CheckBinCapacity",
          {
            type_waste: container.idWaste,
            neto: neto,
          }
        );
        await triggerAvailableBin(false, container.idWaste);
        const res = response.data;
        if (!res.success) {
          alert(res.message);
          return;
        }
        maxWeight = res.bin.max_weight;
        setTargetRollingDoor(res.bin);
        setSelectedBin(res.bin);
        totalWeight = res.bin.weight + totalWeight;
      } else
        totalWeight =
          parseFloat(selectedBin.weight) + totalWeight + getTotalNetoWeight();
      if (totalWeight > parseFloat(maxWeight)) {
        alert("Bin Penuh");
        // setErrorMessage('bin penuh.');
        return null;
      }
      setWasteItems([...wasteItems, { ...container, weight: bruto, neto: neto }]);
      setShowModalConfirmWeight(true);
      return targetRollingDoor;
      //            saveTransaksi();
    } catch (error) {
      console.error(error);
    }
  };

  const updateBinWeight = async () => {
    try {
      const response = await apiClient.post(
        "http://localhost:5000/UpdateBinWeight",
        {
          binId: targetRollingDoor.id,
          neto: getTotalNetoWeight(),
        }
      );
      await triggerAvailableBin(false, wasteItems[0].idWaste);
      await sendDataPanasonicServer();
      //            await sendDataPanasonicServer1();
      setScanData("");
      setUser(null);
      setContainer(null);
      setNeto(0);
      setBruto(0);
      freezeNeto(false);
      setTargetRollingDoor(null);
      setFinalStep(false);
      setIsSubmitAllowed(false);
      setWasteItems([]);
    } catch (error) {
      setScanData("");
      console.error(error);
    }
  };
  const updateBinWeightConfirm = async () => {
    try {
      const response = await apiClient.post(
        "http://localhost:5000/UpdateBinWeight",
        {
          binId: targetRollingDoor.id,
          neto: neto,
        }
      );
      await triggerAvailableBin(false, container.idWaste);
      await sendDataPanasonicServer();
      //          await sendDataPanasonicServer1();
      setTargetRollingDoor(null);
      setScanData("");
      setContainer(null);
      freezeNeto(false);
      setFinalStep(false);
      setIsSubmitAllowed(false);
    } catch (error) {
      console.error(error);
    }
  };
  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      setAllowScan(false);
      if (user == null) handleScan();
      else if (isFinalStep) {
        await updateBinWeight();
      } else {
        handleScan1();
      }
      setAllowScan(true);
    }
  };

  const handleCancel = () => {
    toggleModal();
    setScanData("");
    freezeNeto(false);
  };
  const handleCancelConfirmModal = () => {
    setShowModalConfirmWeight(false);
    setFinalStep(true);
    setScanData("");
    //        updateBinWeight();
    //setWasteId(null);
  };
  const refreshPage = () => {
    setRefresh(true);
  }
  const syncData = () => {
    setSyncing(true);
    try {

      const res = apiClient.get(
        `http://localhost:5000/sync-all`, {
        timeout: 10000,
        validateStatus: () => true
      });
      console.log(res);
    }
    catch (er) {
      console.log(er);
    }
    finally {
      setSyncing(false);
    }
  }

  const ConfirmModal = () => {
    //        triggerAvailableBin(false,container.idWaste)
    setContainer(null);
    setScanData("");
    setFinalStep(false);
    setShowModalConfirmWeight(false);
    //        updateBinWeightConfirm();
  };

  const sendDataPanasonicServer = async () => {
    const rackTargetName = process.env.REACT_APP_RACK_TARGET_CONTAINER;
    console.log([wasteItems, rackTargetName]);
    const rackTargets = rackTargetName.split(",");
    const transaksiData = [];
    for (let i = 0; i < wasteItems.length; i++) {
      //let stationname = containerName.split('-').slice(0, 3).join('-');
      if (isOnline) {
        try {
          if (rackTargets.includes(wasteItems[i].name)) {
            const weightResponse = await apiClient.post(
              `http://${process.env.REACT_APP_PIDSG}/api/pid/sendWeight`,
              {
                binname: wasteItems[i].name,
                weight: wasteItems[i].step2value,
              }
            );
            console.log([weightResponse.data, weightResponse.status]);
          }
        }
        catch (error) {
          console.log(error);
          const data = {
            ...wasteItems[i],
            isSuccess: false,
            status: "Pending|PIDSG|1",
          };
          transaksiData.push(data);
//          await saveTransaksiItem(data);
          continue;
        }
        try {
          const response = await apiClient.post(
            `http://${process.env.REACT_APP_PIDSG}/api/pid/activityLogTempbyPc`,
            {
              badgeno: user.badgeId,
              stationname: "STEP 3 COLLECTION",
              frombin: wasteItems[i].name, //"2-PCS-5",
              weight: wasteItems[i].weight,
              activity: "Movement by System",
              filename: null,
              postby: "Local Step 3",
            }
          );
        }
        catch (error) {
          console.log(error);
          const data = {
            ...wasteItems[i],
            isSuccess: false,
            status: "Pending|PIDSG|2",
          };
          transaksiData.push(data);
//          await saveTransaksiItem(data);
          continue;
        }
        try {
          const response2 = await apiClient.post(
            `http://${process.env.REACT_APP_PIDSG}/api/pid/activityLogbypc`,
            {
              stationname: "STEP 3 COLLECTION",
              frombin: wasteItems[i].name,
              tobin: selectedBin.name ?? "",
            }
          );
        }
        catch (error) {
          console.log(error);
          const data = {
            ...wasteItems[i],
            isSuccess: false,
            status: "Pending|PIDSG|3",
          };
          transaksiData.push(data);
//          await saveTransaksiItem(data);
          continue;
        }
        const data = { ...wasteItems[i], isSuccess: true, status: "Done" };

        transaksiData.push(data);
      } else {
        const data = {
          ...wasteItems[i],
          isSuccess: false,
          status: "Pending|PIDSG|1",
        };
        transaksiData.push(data);
      }
    }
    await saveTransaksiItem(transaksiData);
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
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
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
                        <IoSettingsOutline
                          fontSize="1.5em"
                          style={{ color: "white" }}
                        />
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
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Your Profile
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
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
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <div className="bg-[#f4f6f9] p-5">
        <div className="grid grid-cols-3 grid-flow-col gap-5">
          <div className="row-span-2 col-span-2">
            <div className="flex-1 p-4 border rounded bg-white">
              <h1 className="text-blue-600 font-semibold mb-2 text-xl">
                Bruto
              </h1>
              <div className="">
                <div className="flex-1 flex justify-center p-4 border rounded bg-gray-200 text-5xl font-semibold">
                  {parseFloat(Scales50Kg.weight50Kg).toFixed(2)}
                  <FiRefreshCcw size={20} />
                </div>
                <p className="flex justify-center text-2xl font-bold">
                  Kilogram
                </p>
              </div>
            </div>
          </div>
          <div className="row-span-1 col-span-2">
            <div className="flex-1 p-4 border rounded bg-white">
              <h1 className="text-blue-600 font-semibold mb-2 text-xl">Neto</h1>
              <div className="">
                <div className="flex-1 flex justify-center p-4 border rounded bg-gray-200 text-5xl font-semibold">
                  {neto?.toFixed(2)} <FiRefreshCcw size={20} />
                </div>
                <p className="flex justify-center text-2xl font-bold">
                  Kilogram
                </p>
              </div>
            </div>
          </div>
          <div className="row-span-3">
            <div className="flex-1 p-4 border rounded bg-white h-full">
              <h1 className="text-blue-600 font-semibold text-xl mb-3">
                Scanner Result
              </h1>
              <p>Scan Please</p>
              <input
                type="text"
                onChange={(e) => setScanData(e.target.value)}
                ref={inputRef}
                value={scanData}
                readOnly={!allowScan}
                onBlur={() => {
                  if (inputRef && inputRef.current) {
                    if (document.activeElement != inputRef.current)
                      inputRef.current.focus();
                  }
                }}
                name="text"
                onKeyDown={(e) => handleKeyPress(e)}
                className="block w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="luGGIatKmKvdMkcxpKc8SZD64ex5W0"
              />
              <button
                className="block w-full border rounded py-2 flex justify-center items-center font-bold mt-5 bg-sky-400 text-white text-lg"
                disabled={!isSubmitAllowed}
                onClick={toggleModal}
              >
                Submit
              </button>
              <div className="text-lg mt-5">
                <p>Username: {user?.username} </p>
                <p>Container Id: {container?.name}</p>
                <p>Type Waste: {container?.waste.name}</p>
                {wasteItems.map((item, index) => (
                  <>
                    <p>
                      {index + 1}. {item.name}{" "}
                      {parseFloat(item.neto).toFixed(2)} Kg
                    </p>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-start">
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>

              <div className="bg-white rounded p-8 max-w-md mx-auto z-50">
                <div className="text-center mb-4"></div>
                <form>
                  <Typography variant="h4" align="center" gutterBottom>
                    {parseFloat(neto).toFixed(2)}Kg
                  </Typography>
                  <p>Data Timbangan Sudah Sesuai?</p>
                  <div className="flex justify-center mt-5">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mr-2 rounded"
                    >
                      Ok
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-start">
        {showModalConfirmWeight && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>

              <div className="bg-white rounded p-8 max-w-md mx-auto z-50">
                <div className="text-center mb-4"></div>
                <form>
                  <Typography variant="h6" align="center" gutterBottom>
                    <p>Data Timbangan Telah DiSave!</p>
                    <p>Rolling Door {targetRollingDoor.id} Telah Dibuka!</p>
                  </Typography>
                  <p>Ingin Menimbang lagi ??</p>
                  <div className="flex justify-center mt-5">
                    <button
                      type="button"
                      onClick={ConfirmModal}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mr-2 rounded"
                    >
                      Ok
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelConfirmModal}
                      className="bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-start">
        {errData.show && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>

              <div className="bg-white rounded p-8 max-w-md mx-auto z-50">
                <div className="text-center mb-4"></div>
                <form>
                  <p>{errData.message}</p>
                  <div className="flex justify-center mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setErrData((prev) => ({ show: false, message: '' }));
                        setShowModalConfirmWeight(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 mr-2 rounded"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-start">
        {refresh && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>

              <div className="bg-white rounded p-10 max-w-md mx-auto z-50">
                <div className="text-center mb-4"></div>
                <form>
                  <span className="text-2xl">
                    Apakah benar mau di refresh?
                  </span>
                  <div className="flex justify-center gap-8 mt-5">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="bg-blue-500 hover:bg-blue-600 text-2xl text-white font-bold py-3 px-5 mr-2 rounded"
                    >
                      Iya
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefresh(false)}
                      className="bg-gray-500 hover:bg-red-600 text-2xl text-white font-bold py-3 px-5 rounded"
                    >
                      Tidak
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className='flex-1 rounded border flex-col justify-center gap-40 p-3 bg-white'  >
        <p className="text-center">Server Status: {ipAddress} {isOnline ? "Online" : "Offline"}</p>
        <p className="text-center">Status PLC : {socket?.connected ? "Online" : "Offline"}</p>

        <div className="flex gap-3 flex-row w-100 justify-end">
          {/* <button 
        onClick={()=>syncData()}
        disabled={isSubmitAllowed || syncing}
        className={`p-3 border rounded py-2   justify-center items-center font-bold mt-5 ${!isSubmitAllowed && !syncing ? "bg-sky-400 " : "bg-gray-600"} text-white text-lg`}
        >Sync Data</button> */}
          <button
            onClick={() => refreshPage()}
            disabled={isSubmitAllowed || syncing}
            className={`p-3 border rounded py-2  justify-center items-center font-bold mt-5 ${!isSubmitAllowed && !syncing ? "bg-sky-400 " : "bg-gray-600"} text-white text-lg`}
          >Refresh</button>
        </div>
      </footer>
    </main >
  );
};

export default Home;
