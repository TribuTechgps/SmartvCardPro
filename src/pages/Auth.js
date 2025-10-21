import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [password2, setPassword2] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [usernameValid, setUsernameValid] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        axios.post('https://startapp360.com/api/v1/token/', { email, password })
            .then(response => {
                const { access } = response.data;
                localStorage.setItem('token', access);
                setToken(access);
                toast.success('Success login 🎉');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            })
            .catch(error => {
                console.error('Login error:', error.response ? error.response.data : error);
                toast.error('Error in login 😞');
            })
            .finally(() => setLoading(false));
    };

    const handleRegister = () => {
        if (password !== password2) {
            toast.error('Password not match ❌');
            return;
        }

        setLoading(true);
        axios.post('https://startapp360.com/api/v1/register/', { email, username, password, password2 })
            .then(response => {
                toast.success('Success register! 🎉');
                setTimeout(() => {
                    setIsRegistering(false);
                }, 1500);
            })
            .catch(error => {
                if (error.response && error.response.data) {
                    const { email, password } = error.response.data;
                    let errorMsg = '';
                    if (email) errorMsg += email.join(' ') + ' ';
                    if (password) errorMsg += password.join(' ');
                    toast.error(errorMsg.trim());
                } else {
                    toast.error('Error in register ❌');
                }
            })
            .finally(() => setLoading(false));
    };

    const handlePasswordChange = async () => {
        if (password !== password2) {
            toast.error('Passwords do not match ❌');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.get(`https://startapp360.com/api/v1/register/`);
            const users = response.data;

            if (!users.length) {
                throw new Error('User not found');
            }

            const user = users.find(user => user.email === email);
            if (!user) {
                throw new Error('User not found');
            }

            const payload = {
                email: user.email,  // Asegúrate de obtener estos valores correctamente
                username: user.username,
                password,
                password2
            };
            console.log('Sending PUT request to:', `https://startapp360.com/api/v1/register/${user.id}/`);
            console.log('Payload:', JSON.stringify(payload));

            await axios.put(`https://startapp360.com/api/v1/register/${user.id}/`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            toast.success('Password changed successfully! 🎉');
            setIsChangingPassword(false);
            setIsRegistering(false);
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || error.message || 'Error changing password ❌');
        } finally {
            setLoading(false);
        }
    };

    const toggleRegister = () => {
        setIsRegistering(!isRegistering);
        setIsChangingPassword(false);
    };

    const toggleChangePassword = () => {
        setIsChangingPassword(true);
        setIsRegistering(false);
    };

    const toogleLogin = () => {
        setIsRegistering(false);
        setIsChangingPassword(false);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowPassword2 = () => {
        setShowPassword2(!showPassword2);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateUsername = (username) => {
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailValid(validateEmail(value));
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        setUsernameValid(validateUsername(value));
    };

    return (
        <Container>
            <ToastContainer position="top-right" autoClose={2000} />
            <AuthBox>
                {!isRegistering && !isChangingPassword ? (
                    <>
                        <Title>Init session</Title>
                        <InputWrapper>
                            <Input type="email" placeholder="Email" value={email} onChange={handleEmailChange} />
                            {email && !emailValid && <Alert>Please enter a valid email address</Alert>}
                            {email && emailValid && <SuccessMessage>✓ Valid email format</SuccessMessage>}
                        </InputWrapper>
                        <InputWrapper>
                            <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <Icon onClick={toggleShowPassword}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Icon>
                        </InputWrapper>
                        <Button onClick={handleLogin} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {loading ? <ThreeDots color="#fff" height={20} width={50} /> : 'Login'}
                        </Button>
                        <Text>
                            <LinkText onClick={toggleRegister}>Register</LinkText> | <LinkText onClick={toggleChangePassword}>Change Password</LinkText>
                        </Text>
                    </>
                ) : isRegistering ? (
                    <>
                        <Title>Register</Title>
                        <InputWrapper>
                            <Input type="email" placeholder="Email" value={email} onChange={handleEmailChange} />
                            {email && !emailValid && <Alert>Please enter a valid email address</Alert>}
                            {email && emailValid && <SuccessMessage>✓ Valid email format</SuccessMessage>}
                        </InputWrapper>
                        <InputWrapper>
                            <Input type="text" placeholder="Username" value={username} onChange={handleUsernameChange} />
                            {username && !usernameValid && <Alert>Username must be 3-20 characters, letters, numbers and _ only</Alert>}
                            {username && usernameValid && <SuccessMessage>✓ Valid username format</SuccessMessage>}
                        </InputWrapper>
                        <InputWrapper>
                            <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <Icon onClick={toggleShowPassword}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Icon>
                            {password.length < 8 && <Alert>Password must be at least 8 characters long</Alert>}
                        </InputWrapper>
                        <InputWrapper>
                            <Input type={showPassword2 ? 'text' : 'password'} placeholder="Confirm Password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
                            <Icon onClick={toggleShowPassword2}>
                                {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                            </Icon>
                            {password2.length < 8 && <Alert>Password must be at least 8 characters long</Alert>}
                        </InputWrapper>
                        <Button
                            onClick={handleRegister}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            {loading ? <ThreeDots color="#fff" height={20} width={50} /> : 'Register'}
                        </Button>
                        <Text>
                            <LinkText onClick={toggleRegister}>Back to Login</LinkText>
                        </Text>
                    </>
                ) : (
                    <>
                        <Title>Change Password</Title>
                        <InputWrapper>
                            <Input type="email" placeholder="Email" value={email} onChange={handleEmailChange} />
                            {email && !emailValid && <Alert>Please enter a valid email address</Alert>}
                            {email && emailValid && <SuccessMessage>✓ Valid email format</SuccessMessage>}
                        </InputWrapper>
                        <InputWrapper>
                            <Input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <Icon onClick={toggleShowPassword}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Icon>
                        </InputWrapper>
                        <InputWrapper>
                            <Input type={showPassword2 ? 'text' : 'password'} placeholder="Confirm New Password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
                            <Icon onClick={toggleShowPassword2}>
                                {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                            </Icon>
                        </InputWrapper>
                        <Button
                            onClick={handlePasswordChange}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            {loading ? <ThreeDots color="#fff" height={20} width={50} /> : 'Change Password'}
                        </Button>
                        <Text>
                            <LinkText onClick={toogleLogin}>Back to Login</LinkText>
                        </Text>
                    </>
                )}
            </AuthBox>
        </Container>
    );
};

export default Auth;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #5C4033 0%, #36454F 100%);
  background-attachment: fixed;
`;

const AuthBox = styled.div`
  background: linear-gradient(135deg, #5C4033 0%, #36454F 100%);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(92, 64, 51, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 350px;
  text-align: center;
  border: 1px solid rgba(233, 30, 99, 0.2);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 30%;
    height: 100%;
    background: linear-gradient(135deg, transparent, rgba(0, 188, 212, 0.1));
    pointer-events: none;
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #F5F1EF;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Input = styled.input`
  width: 94%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #4A3329;
  border-radius: 8px;
  font-size: 1rem;
  color: #F5F1EF;
  background: rgba(54, 69, 79, 0.5);
  backdrop-filter: blur(10px);
  &:focus {
    outline: none;
    border-color: #E91E63;
    box-shadow: 0 0 10px rgba(233, 30, 99, 0.3);
  }
  &::placeholder {
    color: #BA9C8D;
  }
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #E91E63 0%, #DB2777 100%);
  color: white;
  padding: 12px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(233, 30, 99, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(135deg, #DB2777 0%, #BE185D 100%);
    box-shadow: 0 10px 40px rgba(233, 30, 99, 0.4);
    transform: translateY(-2px);
  }

  &:hover::before {
    left: 100%;
  }
`;

const Text = styled.div`
  font-size: 0.9rem;
  color: #D1BDB3;
  margin-top: 10px;
`;

const LinkText = styled.span`
  color: #00BCD4;
  cursor: pointer;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 188, 212, 0.3);
  &:hover {
    text-decoration: underline;
    color: #22D3EE;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 94%;
  margin-bottom: 10px;
`;

const Icon = styled.span`
  position: absolute;
  right: 10px;
  top: 30%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #BA9C8D;
  &:hover {
    color: #E91E63;
  }
`;

const Alert = styled.div`
  color: #E91E63;
  font-size: 0.8rem;
  margin-top: 5px;
  text-align: left;
  text-shadow: 0 0 5px rgba(233, 30, 99, 0.5);
`;

const SuccessMessage = styled.div`
  color: #4CAF50;
  font-size: 0.8rem;
  margin-top: 5px;
  text-align: left;
  text-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
`;
