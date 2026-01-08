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
    
    // Estados de validación
    const [emailValid, setEmailValid] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [usernameValid, setUsernameValid] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    
    // Validación individual de contraseña
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        lettersNumbers: false,
        special: false
    });
    const [passwordValid, setPasswordValid] = useState(false);
    
    // Validación individual de confirmación de contraseña
    const [password2Checks, setPassword2Checks] = useState({
        length: false,
        lettersNumbers: false,
        special: false
    });
    const [password2Valid, setPassword2Valid] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);

    const handleLogin = () => {
        if (!email || !password) {
            toast.error('Por favor ingresa tu email y contraseña');
            return;
        }

        setLoading(true);
        axios.post('https://startapp360.com/api/v1/token/', { email, password })
            .then(response => {
                const { access } = response.data;
                if (access) {
                    localStorage.setItem('token', access);
                    // También guardar credenciales para Basic Auth (necesario para /userimage/)
                    localStorage.setItem('auth_username', email);
                    localStorage.setItem('auth_password', password);
                    setToken(access);
                    window.location.href = '/';
                } else {
                    toast.error('No se recibió un token válido del servidor');
                }
            })
            .catch(error => {
                console.error('Login error:', error.response ? error.response.data : error);
                if (error.response) {
                    if (error.response.status === 401) {
                        toast.error('Email o contraseña incorrectos. Verifica tus credenciales');
                    } else if (error.response.status === 400) {
                        toast.error('Datos inválidos. Por favor verifica tu email y contraseña');
                    } else {
                        toast.error(`Error: ${error.response.data?.detail || error.response.data?.message || 'Error al iniciar sesión'}`);
                    }
                } else if (error.request) {
                    toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet');
                } else {
                    toast.error('Error inesperado al iniciar sesión');
                }
            })
            .finally(() => setLoading(false));
    };

    const handleRegister = () => {
        if (password !== password2) {
            toast.error('Passwords do not match ❌');
            return;
        }

        if (!passwordValid || !password2Valid) {
            toast.error('Please ensure your password meets all requirements');
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

        if (!passwordValid || !password2Valid) {
            toast.error('Please ensure your password meets all requirements');
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
                email: user.email,
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
        // Resetear validaciones
        setEmail('');
        setPassword('');
        setPassword2('');
        setUsername('');
        setEmailValid(false);
        setEmailError('');
        setUsernameValid(false);
        setUsernameError('');
        setPasswordChecks({ length: false, lettersNumbers: false, special: false });
        setPasswordValid(false);
        setPassword2Checks({ length: false, lettersNumbers: false, special: false });
        setPassword2Valid(false);
        setPasswordMatch(false);
    };

    const toggleChangePassword = () => {
        setIsChangingPassword(true);
        setIsRegistering(false);
        // Resetear validaciones
        setEmail('');
        setPassword('');
        setPassword2('');
        setEmailValid(false);
        setEmailError('');
        setPasswordChecks({ length: false, lettersNumbers: false, special: false });
        setPasswordValid(false);
        setPassword2Checks({ length: false, lettersNumbers: false, special: false });
        setPassword2Valid(false);
        setPasswordMatch(false);
    };

    const toogleLogin = () => {
        setIsRegistering(false);
        setIsChangingPassword(false);
        // Resetear validaciones
        setEmail('');
        setPassword('');
        setPassword2('');
        setUsername('');
        setEmailValid(false);
        setEmailError('');
        setUsernameValid(false);
        setUsernameError('');
        setPasswordChecks({ length: false, lettersNumbers: false, special: false });
        setPasswordValid(false);
        setPassword2Checks({ length: false, lettersNumbers: false, special: false });
        setPassword2Valid(false);
        setPasswordMatch(false);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowPassword2 = () => {
        setShowPassword2(!showPassword2);
    };

    // Validación de email
    const validateEmail = (email) => {
        if (!email) {
            setEmailError('Please enter a valid email');
            setEmailValid(false);
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            setEmailError('Valid email');
            setEmailValid(true);
            return true;
        } else {
            setEmailError('Please enter a valid email');
            setEmailValid(false);
            return false;
        }
    };

    // Validación de username
    const validateUsername = (username) => {
        if (!username) {
            setUsernameError('Username must be at least 3 characters');
            setUsernameValid(false);
            return false;
        }
        if (username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)) {
            setUsernameError('Valid username');
            setUsernameValid(true);
            return true;
        } else {
            setUsernameError('Username must be at least 3 characters');
            setUsernameValid(false);
            return false;
        }
    };

    // Validación avanzada de contraseña con validación individual
    const validatePassword = (pass) => {
        const checks = {
            length: pass.length >= 8,
            lettersNumbers: /[a-zA-Z]/.test(pass) && /[0-9]/.test(pass),
            special: /[/*\-+!@#$%^&*(),.?":{}|<>]/.test(pass)
        };
        
        setPasswordChecks(checks);
        
        const isValid = checks.length && checks.lettersNumbers && checks.special;
        setPasswordValid(isValid);
        
        return isValid;
    };

    // Validación de confirmación de contraseña
    const validatePassword2 = (pass2) => {
        const checks = {
            length: pass2.length >= 8,
            lettersNumbers: /[a-zA-Z]/.test(pass2) && /[0-9]/.test(pass2),
            special: /[/*\-+!@#$%^&*(),.?":{}|<>]/.test(pass2)
        };
        
        setPassword2Checks(checks);
        
        const isValid = checks.length && checks.lettersNumbers && checks.special;
        setPassword2Valid(isValid);
        
        // Verificar si coincide con password
        if (pass2 && password) {
            setPasswordMatch(pass2 === password);
        } else {
            setPasswordMatch(false);
        }
        
        return isValid && pass2 === password;
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        validateEmail(value);
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        validateUsername(value);
    };

    const handlePasswordChange_input = (e) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
        // Si hay password2, validar también la coincidencia
        if (password2) {
            validatePassword2(password2);
        }
    };

    const handlePassword2Change = (e) => {
        const value = e.target.value;
        setPassword2(value);
        validatePassword2(value);
    };

    return (
        <Container>
            <ToastContainer position="top-right" autoClose={2000} />
            <AuthBox>
                {!isRegistering && !isChangingPassword ? (
                    <>
                        <Title>Iniciar Sesión</Title>
                        {token ? (
                            <>
                                <SuccessMessage style={{ textAlign: 'center', marginBottom: '1rem', padding: '10px', borderRadius: '8px', background: 'rgba(76, 175, 80, 0.2)' }}>
                                    ✓ Ya estás autenticado. Tus tarjetas se guardarán en la nube automáticamente.
                                </SuccessMessage>
                                <Button 
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        setToken('');
                                        toast.info('Sesión cerrada');
                                    }} 
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        marginTop: '0.5rem',
                                        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                        width: '100%'
                                    }}
                                >
                                    Cerrar Sesión
                                </Button>
                            </>
                        ) : (
                            <>
                                <Text style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                    Inicia sesión para guardar tus tarjetas en la nube
                                </Text>
                                <InputWrapper>
                                    <Input type="email" placeholder="Email" value={email} onChange={handleEmailChange} />
                                    <ValidationMessage isValid={emailValid}>{emailError || (email ? 'Please enter a valid email' : '')}</ValidationMessage>
                                </InputWrapper>
                                <InputWrapper>
                                    <PasswordInput 
                                        type={showPassword ? 'text' : 'password'} 
                                        placeholder="Password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                    <PasswordIcon onClick={toggleShowPassword}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </PasswordIcon>
                                </InputWrapper>
                                <Button onClick={handleLogin} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} disabled={loading}>
                                    {loading ? <ThreeDots color="#fff" height={20} width={50} /> : 'Iniciar Sesión'}
                                </Button>
                                <Text>
                                    <LinkText onClick={toggleRegister}>Register</LinkText> | <LinkText onClick={toggleChangePassword}>Change Password</LinkText>
                                </Text>
                            </>
                        )}
                    </>
                ) : isRegistering ? (
                    <>
                        <Title>Register</Title>
                        <InputWrapper>
                            <Input type="email" placeholder="Email" value={email} onChange={handleEmailChange} />
                            <ValidationMessage isValid={emailValid}>{emailError || (email ? 'Please enter a valid email' : '')}</ValidationMessage>
                        </InputWrapper>
                        <InputWrapper>
                            <Input type="text" placeholder="Username" value={username} onChange={handleUsernameChange} />
                            <ValidationMessage isValid={usernameValid}>{usernameError || (username ? 'Username must be at least 3 characters' : '')}</ValidationMessage>
                        </InputWrapper>
                        <InputWrapper>
                            <PasswordInput 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="Password" 
                                value={password} 
                                onChange={handlePasswordChange_input} 
                            />
                            <PasswordIcon onClick={toggleShowPassword}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </PasswordIcon>
                            <PasswordValidationMessage checks={passwordChecks} isValid={passwordValid} />
                        </InputWrapper>
                        <InputWrapper>
                            <PasswordInput 
                                type={showPassword2 ? 'text' : 'password'} 
                                placeholder="Confirm Password" 
                                value={password2} 
                                onChange={handlePassword2Change} 
                            />
                            <PasswordIcon onClick={toggleShowPassword2}>
                                {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                            </PasswordIcon>
                            <PasswordValidationMessage checks={password2Checks} isValid={password2Valid && passwordMatch} />
                            {password2 && password && !passwordMatch && (
                                <Alert>Passwords do not match</Alert>
                            )}
                            {password2 && password && passwordMatch && (
                                <SuccessMessage>Passwords match ✓</SuccessMessage>
                            )}
                        </InputWrapper>
                        <Button
                            onClick={handleRegister}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            disabled={loading || !emailValid || !usernameValid || !passwordValid || !password2Valid || !passwordMatch}
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
                            <ValidationMessage isValid={emailValid}>{emailError || (email ? 'Please enter a valid email' : '')}</ValidationMessage>
                        </InputWrapper>
                        <InputWrapper>
                            <PasswordInput 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="New Password" 
                                value={password} 
                                onChange={handlePasswordChange_input} 
                            />
                            <PasswordIcon onClick={toggleShowPassword}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </PasswordIcon>
                            <PasswordValidationMessage checks={passwordChecks} isValid={passwordValid} />
                        </InputWrapper>
                        <InputWrapper>
                            <PasswordInput 
                                type={showPassword2 ? 'text' : 'password'} 
                                placeholder="Confirm New Password" 
                                value={password2} 
                                onChange={handlePassword2Change} 
                            />
                            <PasswordIcon onClick={toggleShowPassword2}>
                                {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                            </PasswordIcon>
                            <PasswordValidationMessage checks={password2Checks} isValid={password2Valid && passwordMatch} />
                            {password2 && password && !passwordMatch && (
                                <Alert>Passwords do not match</Alert>
                            )}
                            {password2 && password && passwordMatch && (
                                <SuccessMessage>Passwords match ✓</SuccessMessage>
                            )}
                        </InputWrapper>
                        <Button
                            onClick={handlePasswordChange}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            disabled={loading || !emailValid || !passwordValid || !password2Valid || !passwordMatch}
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

// Componente de mensaje de validación de contraseña con validación individual
const PasswordValidationMessage = ({ checks, isValid }) => {
    if (!checks) return null;
    
    return (
        <PasswordValidationContainer>
            <ValidationLine isValid={checks.length}>
                8-character password
            </ValidationLine>
            <ValidationLine isValid={checks.lettersNumbers}>
                Include letters and numbers
            </ValidationLine>
            <ValidationLine isValid={checks.special}>
                Special characters/*-+
            </ValidationLine>
            {isValid && (
                <SuccessMessage style={{ marginTop: '8px' }}>Valid password ✓</SuccessMessage>
            )}
        </PasswordValidationContainer>
    );
};

export default Auth;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #5C4033 0%, #36454F 100%);
  background-attachment: fixed;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const AuthBox = styled.div`
  background: linear-gradient(135deg, #5C4033 0%, #36454F 100%);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(92, 64, 51, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 28rem;
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
  font-size: 1.5rem;
  font-weight: 600;
  color: #F5F1EF;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 4px;
  border: 1px solid #4A3329;
  border-radius: 8px;
  font-size: 1rem;
  color: #F5F1EF;
  background: rgba(54, 69, 79, 0.5);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #E91E63;
    box-shadow: 0 0 10px rgba(233, 30, 99, 0.3);
  }
  
  &::placeholder {
    color: #BA9C8D;
  }
`;

const PasswordInput = styled(Input)`
  padding-right: 48px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 16px;
  text-align: left;
`;

const PasswordIcon = styled.span`
  position: absolute;
  right: 16px;
  top: 28px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #BA9C8D;
  font-size: 1.2rem;
  
  &:hover {
    color: #E91E63;
  }
`;

const ValidationMessage = styled.div`
  color: ${props => props.isValid ? '#28a745' : '#dc3545'};
  font-size: 0.875rem;
  margin-top: 6px;
  text-align: left;
  min-height: 20px;
  text-shadow: ${props => props.isValid ? '0 0 5px rgba(40, 167, 69, 0.5)' : '0 0 5px rgba(220, 53, 69, 0.5)'};
`;

const PasswordValidationContainer = styled.div`
  margin-top: 8px;
  text-align: left;
`;

const ValidationLine = styled.div`
  color: ${props => props.isValid ? '#28a745' : '#dc3545'};
  font-size: 0.875rem;
  margin-bottom: 4px;
  text-shadow: ${props => props.isValid ? '0 0 5px rgba(40, 167, 69, 0.5)' : '0 0 5px rgba(220, 53, 69, 0.5)'};
  transition: color 0.3s ease;
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #E91E63 0%, #DB2777 100%);
  color: white;
  padding: 12px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(233, 30, 99, 0.3);
  position: relative;
  overflow: hidden;
  opacity: ${props => props.disabled ? 0.6 : 1};

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

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #DB2777 0%, #BE185D 100%);
    box-shadow: 0 10px 40px rgba(233, 30, 99, 0.4);
    transform: translateY(-2px);
  }

  &:hover:not(:disabled)::before {
    left: 100%;
  }
`;

const Text = styled.div`
  font-size: 0.9rem;
  color: #D1BDB3;
  margin-top: 16px;
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

const Alert = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 6px;
  text-align: left;
  text-shadow: 0 0 5px rgba(220, 53, 69, 0.5);
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.875rem;
  margin-top: 6px;
  text-align: left;
  text-shadow: 0 0 5px rgba(40, 167, 69, 0.5);
`;
