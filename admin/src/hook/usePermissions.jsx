// hooks/usePermissions.js
import { useEffect, useState } from 'react';
import useApi from './useApi';
import axios from 'axios';

export default function usePermissions() {
  const { user } = useApi()
  const [permissions, setPermissions] = useState(new Set());
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [isUser, setIsUser] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await user.permission.get();
        const permissionNames = response.permissions.map((perm) => perm.codename);
        setPermissions(new Set(permissionNames));
        setIsStaff(response.is_staff);
        setIsSuperuser(response.is_superuser);

        if (response.is_superuser) {
          setIsUser(false);
        } else if (response.is_staff) {
          setIsUser(false);
        } else {
          setIsUser(true);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permission) => {
    return permissions.has(permission) || isSuperuser;
  };

  return { hasPermission, isStaff, isSuperuser, loading, isUser };
}