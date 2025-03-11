import React, { useEffect, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios';
import { initializeSocket, recieveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer';

const Project = () => {

    const location = useLocation();

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [project, setProject] = useState({});
    const [message, setMessage] = useState('');
    const { user } = useContext(UserContext);
    // const messageBox = React.createRef();
    const [messages, setMessages] = useState([]);
    const [fileTree, setFileTree] = useState({});
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [webContainer, setwebContainer] = useState(null);
    const [iframeURL, setIframeUrl] = useState(null);
    const [runProcess, setRunProcess] = useState(null);

    useEffect(() => {
        initializeSocket(location.state.project._id);

        if (!webContainer) {
            getWebContainer().then(container => {
                setwebContainer(container);
                console.log("container started")
            })
        }
        // initializeSocket(project._id);

        recieveMessage('project-message', async data => {
            // console.log(data);
            const message = JSON.parse(data.message);
            console.log(message);

            await webContainer?.mount(message.fileTree);

            if (message.fileTree) {
                setFileTree(message.fileTree);
            }
            // appendIncomingMessage(data);
            setMessages(prevState => [...prevState, data]);
        })
        axios.get(`projects/get-project/${location.state.project._id}`).then(res => {
            console.log(res.data.project);
            setProject(res.data.project);
            setFileTree(res.data.project.fileTree);
        })

        axios.get('/users/all').then((res) => {
            setUsers(res.data.users);
        }).catch(err => {
            console.log(err);
        })
    }, []);

    const handleUserClick = (id) => {
        // unique way of handling this 
        // no repetation of same elements should happen with users array 
        // on twice click make it unselected 
        setSelectedUserId(prevState => {
            const newSelectedUserId = new Set(prevState);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            }
            else {
                newSelectedUserId.add(id);
            }
            return Array.from(newSelectedUserId);
            // Array(newSelectedUserId) === output me we get array as [set[1st element]] which is a problem. it actually put set in array and then makes another array in it storing it elements
            // Array.from(newSelectedUserId) this forms array with elements present in set
        });
    }

    const addCollaborator = () => {
        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: selectedUserId
        }).then(res => {
            console.log(res.data);
            setIsModalOpen(false);
        }).catch((error) => {
            console.log(error);
        })
    }

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data);
        }).catch(err => {
            console.log(err);
        })
    }

    function send() {
        sendMessage('project-message', {
            message,
            sender: user
            // user object seedha bhejna not a good practice according to teacher.
            // id bhejna and then backend par from id uski info extract krna that's a good practice
        })
        // appendOutgoingMessage(message);
        setMessages(prevState => [...prevState, { sender: user, message }])
        setMessage("");
    }

    function WriteAiMessage(message) {
        const messageObject = JSON.parse(message);
        return (
            <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
                <Markdown>{messageObject.text}</Markdown>
            </div>
        )
    }

    // function appendIncomingMessage(data) {
    //     const messageBox = document.querySelector('.message-box');
    //     const message = document.createElement('div');

    //     if (data.sender._id === 'ai') {

    //     } else {
    //         message.classList.add('message', 'max-w-56', 'flex', 'flex-col', 'p-2', 'bg-slate-50', 'w-fit', 'rounded-md');
    //         message.innerHTML = `<small className='opacity-65 text-xs'>${data.sender.email}</small>
    //                         <p className='text-sm'>${data.message}</p>`
    //     }
    //     messageBox.appendChild(message);
    //     scrollToBottom();
    // }


    // function appendOutgoingMessage(data) {
    //     const messageBox = document.querySelector('.message-box');
    //     const message = document.createElement('div');
    //     message.classList.add('ml-auto', 'max-w-56', 'flex', 'flex-col', 'p-2', 'bg-slate-50', 'w-fit', 'rounded-md');
    //     message.innerHTML = `<small className='opacity-65 text-xs'>${user.email}</small>
    //                         <p className='text-sm'>${data}</p>`
    //     messageBox.appendChild(message);
    //     scrollToBottom();
    // }

    function scrollToBottom() {
        // not worked in my situation
        const messageBox = document.querySelector('.message-box');
        messageBox.scrollTop = messageBox.scrollHeight
    }

    return (
        <main className='h-screen w-screen flex'>
            <section className='left relative flex flex-col h-screen min-w-96 bg-slate-300'>
                <header className='flex justify-between items-center w-full p-2 px-4 bg-slate-100 absolute top-0'>
                    <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
                        <i className='ri-add-fill mr-1'></i>
                        <p>Add Collaborator</p>
                    </button>
                    <button className='p-2' onClick={() => { setIsSidePanelOpen(!isSidePanelOpen) }}>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>

                <div className="conversation-area flex-grow flex flex-col pt-14 pb-10 overflow-auto [&::-webkit-scrollbar]:hidden">
                    <div className="message-box flex-grow flex flex-col gap-1 p-1 scroll-smooth">
                        {messages.map((msg, index) => (
                            <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-56'} ${msg.sender._id === user._id && 'ml-auto'} message flex flex-col p-2 w-fit bg-slate-50`}>
                                <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                                <div className='text-sm'>{msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : msg.message}</div>
                            </div>
                        ))}
                    </div>
                    <div className="inputField w-full flex absolute bottom-0">
                        <input value={message} onChange={(e) => { setMessage(e.target.value) }} className='p-2 px-4 border-none outline-none flex-grow' type='text' placeholder='Enter message' />
                        <button className='px-5 bg-slate-950 text-white' onClick={send}>
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>

                <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>

                    <header className='flex justify-between items-center p-2 px-4 bg-slate-200'>
                        <h1 className='font-semibold text-lg'>Collaborators</h1>
                        <button
                            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                            className='p-2'
                        >
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>

                    <div className="users flex flex-col gap-2">

                        {project.users && project.users.map(user => {
                            return (
                                <div key={user._id} className="user flex items-center gap-2 cursor-pointer hover:bg-slate-200 p-2">
                                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                                        <i className='ri-user-fill absolute'></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>

                            );
                        })}
                    </div>

                </div>

            </section>

            <section className="right bg-red-50 flex-grow h-full flex">
                <div className="explorer h-full max-w-64 min-w-42 bg-slate-200">
                    <div className="file-tree w-full space-y-1">
                        {
                            Object.keys(fileTree).map((file, index) => (
                                <button
                                    onClick={() => {
                                        setCurrentFile(file);
                                        setOpenFiles([...new Set([...openFiles, file])])
                                    }}
                                    className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full">
                                    <p
                                        className='font-semibold text-lg'
                                    >{file}</p>
                                </button>
                            ))
                        }
                    </div>
                </div>

                <div className='code-editor flex flex-col flex-grow h-full'>
                    <div className="top flex justify-between w-full">
                        <div className='files flex'>
                            {
                                openFiles.map((file, index) => (
                                    <button
                                        onClick={() => setCurrentFile(file)}
                                        className={`open-file cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-200 w-fit ${currentFile === file && "bg-slate-300"}`}
                                    >
                                        <p className='text-lg font-semibold p-2'>{file}</p>
                                    </button>
                                ))
                            }
                        </div>

                        <div className="actions flex gap-2">
                            <button
                                onClick={async () => {
                                    await webContainer.mount(fileTree);
                                    // not accesable server due to --> jo server webcontainer se bna hai usse hum ushi tab me access kar sakte hai 
                                    // solution is to use iframe
                                    const installProcess = await webContainer.spawn("npm", ["install"]);

                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk);
                                        }
                                    }))

                                    if (runProcess) {
                                        runProcess.kill();
                                    }

                                    const tempRunProcess = await webContainer.spawn("npm", ["start"]);

                                    tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk);
                                        }
                                    }))

                                    setRunProcess(tempRunProcess);

                                    webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url);
                                        setIframeUrl(url);
                                    })
                                }}
                                className='p-2 px-4 bg-slate-300 text-white'
                            >
                                run
                            </button>
                        </div>

                    </div>

                    <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        {
                            // not working not beautifying f
                            fileTree[currentFile] && (
                                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                                    <pre
                                        className='hljs h-full'>
                                        <code
                                            className='hljs h-full outline-none'
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                                const ft = {
                                                    ...fileTree,
                                                    [currentFile]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft);
                                                saveFileTree(ft);
                                                // setFileTree(prevFileTree => ({
                                                //     ...prevFileTree,
                                                //     [currentFile]: {
                                                //         ...prevFileTree[currentFile],
                                                //         file: {
                                                //             ...prevFileTree[currentFile].file,
                                                //             contents: updatedContent
                                                //         }
                                                //     }
                                                // }));
                                            }}
                                            dangerouslySetInnerHTML={{ __html: hljs.highlight(fileTree[currentFile].file.contents, { language: 'javascript', ignoreIllegals: true }).value }}
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                paddingBottom: '25rem',
                                                counterSet: 'line-numbering',
                                            }}
                                        />
                                        {/* </code> */}
                                        {/* <textarea
                                                value={fileTree[currentFile].file.contents}
                                                onChange={(e) => {
                                                    setFileTree({
                                                        ...fileTree,
                                                        [currentFile]: {
                                                            files: {
                                                                contents: e.target.value
                                                            }
                                                        }
                                                    })
                                                }}
                                                className='w-full h-full p-4 bg-slate-50 outline-none '
                                            >
                                            </textarea> */}
                                    </pre>
                                </div>
                            )
                        }
                    </div>

                </div>
                {iframeURL && webContainer && (
                    <div className='flex flex-col min-w-96 h-full'>
                        <div className="address-bar">
                            <input
                                type='text'
                                onChange={(e) => { setIframeUrl(e.target.value) }}
                                className='w-full p-2 px-4 bg-slate-200'
                                value={iframeURL}
                            />
                        </div>
                        <iframe src={iframeURL} className='w-full h-full'></iframe>
                    </div>
                )}

            </section>

            {/* MODAL */}
            {isModalOpen && <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg overflow-y-auto max-h-[80vh]"> {/* Responsive width and max height */}
                    <h2 className="text-lg font-semibold mb-4">Select User</h2>
                    <ul className="space-y-2 max-h-96 overflow-auto">
                        {users.map((user) => (
                            <li
                                key={user._id}
                                className={`p-3 rounded-md cursor-pointer ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100' // Highlight selected user
                                    }`}
                                onClick={() => { handleUserClick(user._id) }}
                            >
                                <div className="flex items-center"> {/* Align icon and name */}
                                    <div className="mr-2"> {/* Optional user icon/avatar */}
                                        <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600 relative">
                                            <i className='ri-user-fill absolute'></i>
                                        </div>

                                    </div>
                                    <span>{user.email}</span> {/* Display user name */}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex justify-end space-x-5">
                        <button onClick={() => { setIsModalOpen(false) }} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                            Close
                        </button>
                        <button onClick={addCollaborator} className={`px-4 py-2 bg-blue-500 text-white rounded-md ${Array.from(selectedUserId).length !== 0 ? "bg-blue-500" : "bg-gray-300"}`}>
                            Add Collaborator
                        </button>
                    </div>
                </div>
            </div>}
        </main>
    )
}

export default Project

// DEBUGGING WITH THE HELP OF LAYERS FEATURE OF CHROME
