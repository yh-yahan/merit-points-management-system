import { useState, useEffect } from 'react';
import api from '../../api';

function AdminNotifications(){
  const [search, setSearch] = useState('');
  const [notificationMessages, setNotificationMessages] = useState({messages: []});

  useEffect(() => {
    async function fetchNotification(){
      try{
        const response = await api.get(`/admin/notification?search=${search}`);
        setNotificationMessages({ messages: response.data.messages });

        await api.patch('/admin/mark-notification-as-read');
      }
      catch(err){
        console.log(err);
      }
    }

    fetchNotification();
  }, [search]);

  const newMessageCount = notificationMessages.messages.filter((message) => message.new).length;

  return (
    <div className="container-fluid ms-5 mt-3">
      <h2 className="ms-5 d-flex justify-content-evenly align-items-center">Notifications</h2>
      <div className="container">
        <div className="row">
          <div className="col-12 mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
            <p>New notifications: {newMessageCount}</p>
            <input 
            type="search" 
            placeholder="Search notifications" 
            className="border p-2" 
            onChange={(e) => setSearch(e.target.value)}/>
          </div>
          {notificationMessages.messages ? notificationMessages.messages.map((message, i) => (
            <div key={i} className="col-12 mb-3 d-flex align-items-center border-bottom border-secondary-subtle p-3">
              <p>
                {message.new && <span className="badge text-bg-primary">New</span>}
              </p>
              <p className="ms-3"><b>{message.title}</b> {message.message}</p>
              <p className="ms-auto text-secondary">{message.time}</p>
            </div>
          ))
          : <div 
            className="col-12 mb-3 d-flex justify-content-center align-items-center p-3"
            style={{height: '50vh'}}>
              <p className="text-danger">No notifications found</p>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;
