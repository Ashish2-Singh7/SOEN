import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';
import { UserContext } from '../context/user.context.jsx';

const Login = () => {

    const { setUser } = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    function submitHandler(e) {
        
        e.preventDefault();
        
        axios.post('/users/login', {
            email, password
        }).then((res) => {
            console.log(res.data);
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            navigate('/');
        }).catch((err) => {
            console.log(err.response.data);
        })
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-white mb-4">Login</h2>
                <form
                    onSubmit={submitHandler}
                >
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-400 text-sm font-bold mb-2">
                            Email
                        </label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-400 text-sm font-bold mb-2">
                            Password
                        </label>
                        <input

                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            Login
                        </button>
                        <Link to="/register" className="text-sm text-blue-500 hover:text-blue-700">
                            Create an account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;