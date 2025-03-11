import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const Home = () => {

  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(null);
  const [project, setProject] = useState([]);

  const navigate = useNavigate();


  function createProject(e) {
    e.preventDefault();
    console.log({ projectName });

    axios.post('/projects/create', {
      name: projectName
    })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  useEffect(() => {
    axios.get('/projects/all').then((res) => {
      setProject(res.data.projects);
    }).catch((err) => {
      console.log(err);
    })
  }, []);

  return (
    <main className='p-4'>
      <div className="projects flex flex-wrap gap-3">
        <button onClick={() => setIsModalOpen(true)} className='project p-4 border border-slate-300 rounded-md'>
          New Project
          <i className="ri-link ml-2"></i>
        </button>

        {project.map((project) => (
          <div key={project._id} onClick={()=> {navigate('/project', { state: { project }})}} className='project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-52 hover:bg-slate-200'>
            <h2 className='font-semibold'>{project.name}</h2>
            <div className='flex gap-2'>
              <p><small><i className="ri-user-line"></i></small> <small>Collaborators</small> :</p>
              {project.users.length}
            </div>
          </div>
        ))}

      </div>

      {isModalOpen && (<div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
          <form onSubmit={createProject}>
            <div className="mb-4">
              <label htmlFor="projectName" className="block text-gray-700 text-sm font-bold mb-2">
                Project Name:
              </label>
              <input
                type="text"
                id="projectName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>)}

    </main>
  )
}

export default Home;

