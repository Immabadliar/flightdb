document.addEventListener('DOMContentLoaded', () => {
    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5500/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            

            const data = await response.json();
            alert(data.message);

            if (response.status === 200) {
                // On successful login, load the next page
                window.location.href = 'page.html';  // Make sure 'page.html' exists and is in the correct path
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login.');
        }
    });
});
