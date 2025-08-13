'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.list({ page, pageSize, search });
      setUsers(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro quieres eliminar este usuario?')) return;
    try {
      await userService.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Error al eliminar usuario');
    }
  };

  return (
    <div>
      <h1>Usuarios</h1>
      <input
        type="text"
        placeholder="Buscar por username, email o role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Link href="/dashboard/users/new">Nuevo Usuario</Link>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <a href={`/dashboard/users/${u.id}`}>Editar</a>{' '}
                    <button onClick={() => handleDelete(u.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <span> Página {page} </span>
            <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
