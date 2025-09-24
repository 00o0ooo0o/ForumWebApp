import React, {useState} from 'react'
import axios from 'axios'
import '../css/AuthPage.css'

export function Signup({ onSwitchToLogin }){
    //[the current state value, function to update that value]
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    
        const openModal = (type) => {
            setModalType(type);
            setIsOpen(true);
        };
    
        const closeModal = () => {
            setIsOpen(false);
            setModalType(null);
        };
    

    function handleSignup(event){
        event.preventDefault(); //prevents the form from reloading the page
        axios.post('http://localhost:8000/api/register/', { username, email, password })
        .then(res => {
            console.log(res.data);
            alert("Registration successful!");
        })
        .catch(error => {
            console.log(error);
        });
    }


    return( //returns jsx - the syntax React uses to describe UI
        <div class="Auth">
            <h1>Sign Up</h1>

            <form onSubmit={handleSignup}>
                <input //controlled component (its value is controlled by React state (value), not by the DOM)
                    type="text"
                    placeholder="Username"
                    value={username} //input reads from state 
                    onChange={e => setUsername(e.target.value)}
                    //when user types, value of e (DOM Element That Triggered the Event) is handeled by setValue()
                />
                <br />
                <input 
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <br />
                <input 
                    type="text"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <br />
                <button type="Sign Up">Submit</button>
                
                <div class="header-line">
                    <h2>Already have an account?</h2>  
                    <h3 onClick={onSwitchToLogin}>Log In</h3>
                </div>
            </form>
        </div>
    );
}
