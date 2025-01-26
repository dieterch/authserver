export function loginpage(redirectUrl) {
  return `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
      /* Basic Reset */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
  
      /* Body styling */
      body {
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
  
      /* Form container */
      .login-form {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
        text-align: center;
      }
  
      /* Form elements */
      .login-form h2 {
        margin-bottom: 1.5rem;
        color: #333;
      }
  
      .login-form label {
        display: block;
        font-weight: bold;
        margin-bottom: 0.5rem;
        text-align: left;
      }
  
      .login-form input {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1rem;
      }
  
      .login-form button {
        background-color: #6a11cb;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s;
      }
  
      .login-form button:hover {
        background-color: #2575fc;
      }
  
      /* Add some spacing */
      .login-form .form-group {
        margin-bottom: 1rem;
      }
  
      /* Responsive design */
      @media (max-width: 500px) {
        .login-form {
          padding: 1.5rem;
        }
      }
    </style>
  </head>
  <body>
    <form class="login-form" action="/login?redirect=${redirectUrl}" method="POST">
      <h2>Login</h2>
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
  </body>
  </html>`;
}

export const logoutpage = (prompt = '') => {
    return `
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
        h4 { color: #333; }
        button { padding: 10px 20px; font-size: 16px; background-color: #007BFF; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background-color: #0056b3; }
    </style>
    <h4>${prompt}</h4>
    <form action="/logout" method="POST">
        <button type="submit">Logout</button>
    </form>`;}