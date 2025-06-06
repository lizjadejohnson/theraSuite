import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../utilities/UserContext';
import Spinner from '../components/Spinner';

const EditProfilePage = () => {
    const { user, updateUser, deleteUser } = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');


    useEffect(() => {
        // Pre-fill the form with the current user data
        if (user) {
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdate = async (event) => {
        event.preventDefault();
        //Ensure updated password matches before attempting to save:
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setTimeout(() => setMessage(''), 5000);
            return;
        }
        try {
            await updateUser({ email, password });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            setMessage(error.message || 'Profile update failed. Please try again.');
            setTimeout(() => setMessage(''), 5000);

        }
    };

    const handleDelete = async (event) => {
        event.preventDefault();
        const confirmed = window.confirm("Are you sure you want to delete this profile? This can't be undone!");

        if (confirmed) {
            try {
                await deleteUser();
                setMessage('Profile deleted!');
                setTimeout(() => setMessage(''), 5000);
            } catch (error) {
                setMessage(error.message || 'Unable to delete profile.');
                setTimeout(() => setMessage(''), 5000);
            }
        }
    };

    //If someone is not logged in:
    if (!user) {
      return (
        <Spinner redirectTo={'/'} delay={3000} message={"No user logged in. Redirecting to homepage..."}/>
      );
    };

    return (
        <div className='edit-profile-container'>
            <h2>Edit Profile</h2>
            <form onSubmit={handleUpdate}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label>Confirm New Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                
                <button type="submit">Update Profile</button>
                <button onClick={handleDelete} className='delete-button'>Delete</button>
            </form>
            {message && <p style={{ color: 'red' }}>{message}</p>}
        </div>
    );
};

export default EditProfilePage;
