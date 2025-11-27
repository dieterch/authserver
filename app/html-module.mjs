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
    </form>`;
}

export const forbiddenpage = (prompt = '') => {
  return `
  <style>
      body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
      h2 { color: #333; }
      button { padding: 10px 20px; font-size: 16px; background-color: #007BFF; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
      button:hover { background-color: #0056b3; }
  </style>
  <h2>${prompt}</h2>`;
}

export function adminUsersPage(users) {
  return `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Verwaltung</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 2rem;
      }

      .admin-container {
        background: #fff;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        width: 100%;
        max-width: 900px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      h1, h2 {
        color: #333;
        margin-bottom: 1rem;
      }

      .home-button {
        text-decoration: none;
        background: #6a11cb;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        font-weight: bold;
        transition: background 0.3s;
      }

      .home-button:hover {
        background: #2575fc;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        font-weight: bold;
        display: block;
        margin-bottom: 0.4rem;
      }

      input, select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 5px;
      }

      button {
        background: #6a11cb;
        color: white;
        border: none;
        padding: 0.6rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s;
      }

      button:hover {
        background: #2575fc;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }

      th, td {
        border-bottom: 1px solid #ddd;
        padding: 0.5rem;
        text-align: left;
      }

      th {
        background: #f5f5f5;
      }

      .actions form {
        display: inline-block;
        margin-right: 0.5rem;
      }

      .danger {
        background: #c0392b;
      }

      .danger:hover {
        background: #e74c3c;
      }
    </style>
  </head>

  <body>
    <div class="admin-container">

      <div class="header">
        <h1>🔐 User Verwaltung</h1>
        <a href="/" class="home-button">🏠 Startseite</a>
      </div>

      <h2>Neuen User anlegen</h2>
      <form method="post" action="/admin/users/create">
        <div class="form-group">
          <label>Username</label>
          <input name="username" required>
        </div>

        <div class="form-group">
          <label>Passwort</label>
          <input type="password" name="password" required>
        </div>

        <div class="form-group">
          <label>Rolle</label>
          <select name="role">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <button type="submit">User anlegen</button>
      </form>

      <div style="margin: 2rem 0; border-bottom: 1px solid #ccc;"></div>

      <h2>Bestehende User</h2>

      <table>
        <tr>
          <th>Username</th>
          <th>Rolle</th>
          <th>Aktionen</th>
        </tr>

        ${users.map(u => `
          <tr>
            <td>${u.username}</td>
            <td>${u.role}</td>
            <td class="actions">

              <form method="post" action="/admin/users/update">
                <input type="hidden" name="username" value="${u.username}">
                <select name="role">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <input type="password" name="password" placeholder="Neues Passwort">
                <button type="submit">Speichern</button>
              </form>

              <form method="post" action="/admin/users/delete" onsubmit="return confirm('User wirklich löschen?')">
                <input type="hidden" name="username" value="${u.username}">
                <button type="submit" class="danger">Löschen</button>
              </form>

            </td>
          </tr>
        `).join('')}
      </table>
    </div>
  </body>
  </html>
  `;
}
