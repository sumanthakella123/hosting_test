import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function ManagerLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      username: formData.username,
      password: formData.password,
    });

    if (res?.ok) {
      router.push('/manager/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Manager Login</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-left text-lg">Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded text-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-left text-lg">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded text-lg"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg w-full text-xl"
        >
          Login
        </button>
      </form>
    </div>
  );
}
