<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { currentUser } from '$lib/auth/user-store';
  import { fakeAuth, saveUser } from '$lib/auth/auth-utils';
  import { logAction } from '$lib/auth/audit-log';
  
  let username = '';
  let password = '';
  let errorMsg = '';
  let isLoading = false;
  
  onMount(() => {
    // If already logged in, redirect to section home
    const unsubscribe = currentUser.subscribe(user => {
      if (user) {
        window.location.href = `${base}/${user.primarySection.toLowerCase()}/dashboard`;
      }
    });
    return unsubscribe;
  });
  
  async function handleLogin() {
    if (!username || !password) {
      errorMsg = 'Please enter username and password';
      return;
    }
    
    isLoading = true;
    errorMsg = '';
    
    try {
      const result = await fakeAuth(username, password);
      if (!result) {
        errorMsg = 'Invalid credentials';
        isLoading = false;
        return;
      }
      
      currentUser.set(result);
      saveUser(result);
      logAction(result.username, result.primarySection, 'login', 'User logged in');
      
      // Redirect to section home
      window.location.href = `${base}/${result.primarySection.toLowerCase()}/dashboard`;
    } catch (e) {
      errorMsg = 'An error occurred during login';
      isLoading = false;
    }
  }
  
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<svelte:head>
  <title>Login - Reclame OMS</title>
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <h1>Reclame OMS</h1>
    <p class="subtitle">Sign in to continue</p>
    
    <form on:submit|preventDefault={handleLogin}>
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          id="username"
          type="text"
          bind:value={username} 
          on:keypress={handleKeyPress}
          required 
          disabled={isLoading}
          placeholder="Enter your username"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          type="password" 
          bind:value={password} 
          on:keypress={handleKeyPress}
          required 
          disabled={isLoading}
          placeholder="Enter your password"
        />
      </div>
      
      {#if errorMsg}
        <div class="error" role="alert">{errorMsg}</div>
      {/if}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
    
    <div class="help-text">
      <p>Demo users: boss, admin, cnc, sanding, logistics</p>
      <p class="muted">Use any password for demo</p>
    </div>
  </div>
</div>

<style>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-0);
  padding: 20px;
}

.login-card {
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 48px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
}

.subtitle {
  margin: 0 0 32px 0;
  font-size: 14px;
  color: var(--text-2);
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: var(--text);
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-0);
  color: var(--text);
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--accent, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background: var(--accent, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background: var(--accent-hover, #2563eb);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  padding: 12px;
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
}

.help-text {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  text-align: center;
}

.help-text p {
  margin: 4px 0;
  font-size: 13px;
  color: var(--text-2);
}

.help-text .muted {
  font-size: 12px;
  color: var(--text-3);
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
}
</style>
