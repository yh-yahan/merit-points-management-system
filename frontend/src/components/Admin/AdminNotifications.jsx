import { useState } from 'react';

function AdminNotifications(){
  const [notificationMessages, setNotificationMessages] = useState({
    messages: [
      {
        id: 1,
        title: 'New Sign up: ',
        message: "Student 'Tim' signed up via invitation code of '02kd-f2d1-6fe3'",
        time: "20 min ago",
        new: true
      },
      {
        id: 2,
        title: 'New Sign up: ',
        message: "Student 'Tim' signed up via invitation code of '02kd-f2d1-6fe3'",
        time: "20 min ago",
        new: true
      },
      {
        id: 3,
        title: 'New Sign up: ',
        message: "Student 'Tom' signed up via invitation code of '02kd-f2d1-6fe3'",
        time: "20 min ago",
        new: true
      },
      {
        id: 4,
        title: 'New Sign up: ',
        message: "Student 'John' signed up via invitation code of '02kd-f2d1-6fe3'",
        time: "20 min ago",
        new: true
      },
      {
        id: 5,
        title: 'New Sign up: ',
        message: "Teacher 'Anna' signed up via invitation code of '93ec-z2d1-7fe9'",
        time: "2/11/24",
        new: false
      },
    ]
  });

  return (
    <div className="container-fluid ms-5 mt-3">
      <h2 className="ms-5 d-flex justify-content-evenly align-items-center">Notifications</h2>
      <div className="container">
        <div className="row">
          <div className="col-12 mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
            <p>New notifications: 5</p>
            <input 
            type="search" 
            placeholder="Search notifications" 
            className="border p-2"/>
          </div>
          {notificationMessages.messages.map((message) => (
            <div key={message.id} className="col-12 mb-3 d-flex align-items-center border-bottom border-secondary-subtle p-3">
              <p>
                {message.new && <span className="badge text-bg-primary">New</span>}
              </p>
              <p className="ms-3"><b>{message.title}</b> {message.message}</p>
              <p className="ms-auto text-secondary">{message.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;
