import { useState, useEffect } from 'react';
import api from '../../api';

function AdminNotifications() {
  const [search, setSearch] = useState('');
  const [notificationMessages, setNotificationMessages] = useState({ messages: [] });

  useEffect(() => {
    async function fetchNotification() {
      try {
        const response = await api.get(`/admin/notification?search=${search}`);
        setNotificationMessages({ messages: response.data.messages });

        await api.patch('/admin/mark-notification-as-read');
      }
      catch (err) {
        console.log(err);
      }
    }

    fetchNotification();
  }, [search]);

  const newMessageCount = notificationMessages.messages.filter((message) => message.new).length;

  return (
    <div className="container-fluid px-4 mt-3">
      <h2 className="text-center mb-4">Notifications</h2>

      <div className="container">
        <div className="row">
          <div className="col-12 mb-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center border-bottom border-secondary-subtle p-3">
            <p className="mb-2 mb-md-0">New notifications: {newMessageCount}</p>
            <input
              type="search"
              placeholder="Search notifications"
              className="form-control w-100 w-md-auto"
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
          </div>

          {notificationMessages.messages && notificationMessages.messages.length > 0 ? (
            notificationMessages.messages.map((message, i) => (
              <div
                key={i}
                className="col-12 mb-3 d-flex flex-column flex-md-row align-items-start align-items-md-center border-bottom border-secondary-subtle p-3"
              >
                <div className="d-flex align-items-center mb-2 mb-md-0">
                  {message.new && <span className="badge text-bg-primary me-2">New</span>}
                  <p className="mb-0"><strong>{message.title}</strong> {message.message}</p>
                </div>
                <p className="ms-md-auto text-secondary mt-2 mt-md-0 mb-0">{message.time}</p>
              </div>
            ))
          ) : (
            <div
              className="col-12 d-flex justify-content-center align-items-center p-3"
              style={{ height: '50vh' }}
            >
              <p className="text-danger">No notifications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;
