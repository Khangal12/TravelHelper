import React, { useEffect, useState } from "react";
import axios from "axios";
import { PERMISSIONS } from "../services/permissionService";
import useApi from "../hook/useApi";
import { Select, Checkbox, Button, Spin, Alert } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

const AdminPermissionPanel = () => {
    const { user } = useApi();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const fetchUsers = async () => {
        try {
            const response = await user.user.list();
            setUsers(response);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    useEffect(() => {
       

        fetchUsers();
    }, []);

    const handlePermissionChange = (checkedValues) => {
        setSelectedPermissions(checkedValues);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser || selectedPermissions.length === 0) {
            setMessage("Please select a user and at least one permission.");
            return;
        }

        setLoading(true);
        try {
            await user.permission.update(selectedUser, selectedPermissions);
            setMessage("Permissions updated successfully!");
        } catch (error) {
            setMessage("Error updating permissions.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            {message && <Alert message={message} type={message.includes("Error") ? "error" : "success"} showIcon />}
            <form onSubmit={handleSubmit}>
                {/* User Selection */}
                <div style={{ marginBottom: 16 }}>
                    <label>Хэрэглэгч:</label>
                    <Select
                        value={selectedUser}
                        onChange={(value) => setSelectedUser(value)}
                        placeholder="Select a user"
                        style={{ width: "100%" }}
                    >
                        {users.map((user) => (
                            <Option key={user.id} value={user.id}>
                                {user.username} ({user.email})
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* Permissions Selection */}
                <div style={{ marginBottom: 16 }}>
                    <Checkbox.Group
                        value={selectedPermissions}
                        onChange={handlePermissionChange}
                    >
                        <div>
                            {PERMISSIONS.map((perm) => (
                                <Checkbox key={perm.codename} value={perm.codename}>
                                    {perm.name}
                                </Checkbox>
                            ))}
                        </div>
                    </Checkbox.Group>
                </div>

                {/* Submit Button */}
                <Button
                    type="primary"
                    htmlType="submit"
                    disabled={loading}
                    style={{ width: "100%" }}
                >
                    {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> : "Update Permissions"}
                </Button>
            </form>
        </div>
    );
};

export default AdminPermissionPanel;
